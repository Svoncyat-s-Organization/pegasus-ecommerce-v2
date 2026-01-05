package com.pegasus.backend.features.purchase.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
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
        return purchaseMapper.toResponse(purchase);
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

        purchase.setStatus(request.status());
        Purchase updated = purchaseRepository.save(purchase);
        return purchaseMapper.toResponse(updated);
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
