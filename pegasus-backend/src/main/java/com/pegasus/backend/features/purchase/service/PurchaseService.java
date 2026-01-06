package com.pegasus.backend.features.purchase.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.inventory.service.StockService;
import com.pegasus.backend.features.purchase.dto.*;
import com.pegasus.backend.features.purchase.entity.Purchase;
import com.pegasus.backend.features.purchase.entity.PurchaseItem;
import com.pegasus.backend.features.purchase.entity.PurchaseStatus;
import com.pegasus.backend.features.purchase.entity.Supplier;
import com.pegasus.backend.features.purchase.mapper.PurchaseMapper;
import com.pegasus.backend.features.purchase.repository.PurchaseRepository;
import com.pegasus.backend.features.purchase.repository.SupplierRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseMapper purchaseMapper;
    private final StockService stockService;
    private final com.pegasus.backend.features.catalog.service.VariantService variantService;
    private final com.pegasus.backend.features.catalog.service.ProductService productService;

    public PageResponse<PurchaseResponse> getAll(String search, Pageable pageable) {
        Page<Purchase> page = (search != null && !search.isBlank())
                ? purchaseRepository.search(search.trim(), pageable)
                : purchaseRepository.findAll(pageable);

        List<PurchaseResponse> content = page.getContent().stream()
                .map(purchaseMapper::toResponse)
                .toList();

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    public PurchaseResponse getById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada con id: " + id));
        PurchaseResponse base = purchaseMapper.toResponse(purchase);

        // Enrich items with variant SKU and product name and receivedQuantity
        List<PurchaseItemResponse> enrichedItems = base.items().stream().map(i -> {
            var variant = variantService.getVariantById(i.variantId());
            var product = productService.getProductById(variant.productId());
            return new PurchaseItemResponse(
                    i.id(),
                    i.variantId(),
                    i.quantity(),
                    i.unitCost(),
                    i.subtotal(),
                    i.createdAt(),
                    variant.sku(),
                    product.name(),
                    // mapStruct will populate receivedQuantity if entity has it, otherwise use 0
                    i.receivedQuantity() == null ? 0 : i.receivedQuantity());
        }).toList();

        return new PurchaseResponse(
                base.id(),
                base.supplier(),
                base.warehouseId(),
                base.userId(),
                base.status(),
                base.invoiceType(),
                base.invoiceNumber(),
                base.totalAmount(),
                base.purchaseDate(),
                base.notes(),
                base.createdAt(),
                base.updatedAt(),
                enrichedItems);
    }

    @Transactional
    public PurchaseResponse create(CreatePurchaseRequest request) {
        Supplier supplier = supplierRepository.findById(request.supplierId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Proveedor no encontrado con id: " + request.supplierId()));

        Purchase purchase = new Purchase();
        purchase.setSupplier(supplier);
        purchase.setWarehouseId(request.warehouseId());
        purchase.setUserId(request.userId());
        purchase.setInvoiceType(request.invoiceType().trim());
        purchase.setInvoiceNumber(request.invoiceNumber().trim());
        purchase.setNotes(request.notes());
        purchase.setStatus(PurchaseStatus.PENDING);
        purchase.setPurchaseDate(request.purchaseDate() != null ? request.purchaseDate() : LocalDate.now());

        purchase.getItems().clear();
        for (CreatePurchaseItemRequest itemRequest : request.items()) {
            PurchaseItem item = new PurchaseItem();
            item.setPurchase(purchase);
            item.setVariantId(itemRequest.variantId());
            item.setQuantity(itemRequest.quantity());

            if (itemRequest.unitCost() == null || itemRequest.unitCost().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Costo unitario debe ser mayor o igual a 0");
            }
            item.setUnitCost(itemRequest.unitCost());

            BigDecimal subtotal = itemRequest.unitCost().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            item.setSubtotal(subtotal);

            purchase.getItems().add(item);
        }

        purchase.setTotalAmount(calculateTotal(purchase));

        Purchase saved = purchaseRepository.save(purchase);
        return purchaseMapper.toResponse(saved);
    }

    @Transactional
    public PurchaseResponse updateStatus(Long id, UpdatePurchaseStatusRequest request) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada con id: " + id));

        PurchaseStatus currentStatus = purchase.getStatus();
        PurchaseStatus targetStatus = request.status();

        if (currentStatus == PurchaseStatus.RECEIVED) {
            throw new BadRequestException("La compra ya fue recepcionada y no puede cambiar de estado");
        }

        if (currentStatus == PurchaseStatus.CANCELLED) {
            throw new BadRequestException("La compra está cancelada y no puede cambiar de estado");
        }

        if (targetStatus == PurchaseStatus.PENDING) {
            throw new BadRequestException("No se puede volver a estado PENDIENTE");
        }

        if (targetStatus == PurchaseStatus.RECEIVED) {
            if (purchase.getItems() == null || purchase.getItems().isEmpty()) {
                throw new BadRequestException("No se puede recepcionar una compra sin ítems");
            }

            // Al recepcionar: incrementar stock por cada ítem y registrar movimientos
            // (kardex)
            for (PurchaseItem item : purchase.getItems()) {
                int alreadyReceived = item.getReceivedQuantity() == null ? 0 : item.getReceivedQuantity();
                int remaining = item.getQuantity() - alreadyReceived;
                if (remaining > 0) {
                    stockService.increaseStock(
                            purchase.getWarehouseId(),
                            item.getVariantId(),
                            remaining,
                            item.getUnitCost(),
                            purchase.getId(),
                            purchase.getUserId());
                    item.setReceivedQuantity(item.getQuantity());
                }
            }
        }

        purchase.setStatus(targetStatus);
        Purchase updated = purchaseRepository.save(purchase);
        return purchaseMapper.toResponse(updated);
    }

    @Transactional
    public PurchaseResponse receiveItems(Long id, ReceiveItemsRequest request) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada con id: " + id));

        if (purchase.getStatus() == PurchaseStatus.CANCELLED) {
            throw new BadRequestException("La compra está cancelada y no puede recepcionarse");
        }

        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("No se recibieron ítems válidos");
        }

        // Process each receive item
        for (var ri : request.items()) {
            PurchaseItem item = purchase.getItems().stream()
                    .filter(pi -> pi.getId().equals(ri.itemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + ri.itemId()));

            int remaining = item.getQuantity() - (item.getReceivedQuantity() == null ? 0 : item.getReceivedQuantity());
            if (ri.quantity() <= 0 || ri.quantity() > remaining) {
                throw new BadRequestException("Cantidad a recepcionar inválida para item: " + ri.itemId());
            }

            // Increase stock and record movement
            stockService.increaseStock(
                    purchase.getWarehouseId(),
                    item.getVariantId(),
                    ri.quantity(),
                    item.getUnitCost(),
                    purchase.getId(),
                    purchase.getUserId());

            // Update received quantity
            int newReceived = (item.getReceivedQuantity() == null ? 0 : item.getReceivedQuantity()) + ri.quantity();
            item.setReceivedQuantity(newReceived);
        }

        // If all items fully received, mark purchase as RECEIVED
        boolean allReceived = purchase.getItems().stream()
                .allMatch(pi -> (pi.getReceivedQuantity() != null ? pi.getReceivedQuantity() : 0) >= pi.getQuantity());

        if (allReceived) {
            purchase.setStatus(PurchaseStatus.RECEIVED);
        }

        Purchase saved = purchaseRepository.save(purchase);
        return getById(saved.getId());
    }

    @Transactional
    public void delete(Long id) {
        if (!purchaseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Compra no encontrada con id: " + id);
        }
        purchaseRepository.deleteById(id);
    }

    private BigDecimal calculateTotal(Purchase purchase) {
        return purchase.getItems().stream()
                .map(PurchaseItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
