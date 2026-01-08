package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.CreateVariantRequest;
import com.pegasus.backend.features.catalog.dto.UpdateVariantRequest;
import com.pegasus.backend.features.catalog.dto.VariantResponse;
import com.pegasus.backend.features.catalog.dto.VariantWithStockResponse;
import com.pegasus.backend.features.catalog.entity.Variant;
import com.pegasus.backend.features.catalog.mapper.VariantMapper;
import com.pegasus.backend.features.catalog.repository.ProductRepository;
import com.pegasus.backend.features.catalog.repository.VariantRepository;
import com.pegasus.backend.features.inventory.repository.StockRepository;
import com.pegasus.backend.features.inventory.service.StockService;
import com.pegasus.backend.features.order.repository.OrderItemRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service para gestión de variantes de productos
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class VariantService {

    private final VariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final VariantMapper variantMapper;
    private final StockService stockService;
    private final StockRepository stockRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Obtener todas las variantes con paginación y búsqueda opcional
     */
    public PageResponse<VariantResponse> getAllVariants(String search, Pageable pageable) {
        log.debug("Getting variants with search: {}, page: {}", search, pageable.getPageNumber());

        Page<Variant> page = (search != null && !search.isBlank())
                ? variantRepository.searchVariants(search.trim(), pageable)
                : variantRepository.findAll(pageable);

        List<VariantResponse> content = page.getContent().stream()
                .map(v -> variantMapper.toResponseWithOrders(v, hasOrders(v.getId())))
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

    /**
     * Obtener variante por ID
     */
    public VariantResponse getVariantById(Long id) {
        log.debug("Getting variant by id: {}", id);
        Variant variant = findVariantById(id);
        return variantMapper.toResponseWithOrders(variant, hasOrders(id));
    }

    /**
     * Obtener variantes de un producto
     */
    public List<VariantResponse> getVariantsByProductId(Long productId) {
        log.debug("Getting variants by product id: {}", productId);
        List<Variant> variants = variantRepository.findByProductId(productId);
        return variants.stream()
                .map(v -> variantMapper.toResponseWithOrders(v, hasOrders(v.getId())))
                .toList();
    }

    /**
     * Obtener variantes activas de un producto
     */
    public List<VariantResponse> getActiveVariantsByProductId(Long productId) {
        log.debug("Getting active variants by product id: {}", productId);
        List<Variant> variants = variantRepository.findActiveByProductId(productId);
        return variants.stream()
                .map(v -> variantMapper.toResponseWithOrders(v, hasOrders(v.getId())))
                .toList();
    }

    /**
     * Crear nueva variante
     */
    @Transactional
    public VariantResponse createVariant(CreateVariantRequest request) {
        log.info("Creating variant with SKU: {}", request.sku());

        // Validar que el producto existe
        if (!productRepository.existsById(request.productId())) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + request.productId());
        }

        // Validar unicidad del SKU
        if (variantRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException("Ya existe una variante con ese SKU");
        }

        Variant variant = variantMapper.toEntity(request);
        Variant saved = variantRepository.save(variant);

        // Ensure this new variant appears in all active warehouses with stock 0
        stockService.initializeZeroStockForVariantAcrossActiveWarehouses(saved.getId());

        log.info("Variant created successfully: {}", saved.getSku());
        return variantMapper.toResponseWithOrders(saved, false);
    }

    /**
     * Actualizar variante existente
     */
    @Transactional
    public VariantResponse updateVariant(Long id, UpdateVariantRequest request) {
        log.info("Updating variant: {}", id);

        Variant variant = findVariantById(id);

        // Validar unicidad si se cambia el SKU
        if (request.sku() != null && !request.sku().equals(variant.getSku())) {
            if (variantRepository.existsBySku(request.sku())) {
                throw new IllegalArgumentException("Ya existe una variante con ese SKU");
            }
        }

        variantMapper.updateEntityFromDto(request, variant);
        Variant updated = variantRepository.save(variant);

        log.info("Variant updated successfully: {}", updated.getSku());
        return variantMapper.toResponseWithOrders(updated, hasOrders(id));
    }

    /**
     * Eliminar variante (soft delete)
     */
    @Transactional
    public void deleteVariant(Long id) {
        log.info("Deleting variant: {}", id);
        Variant variant = findVariantById(id);
        variant.setIsActive(false);
        variantRepository.save(variant);
        log.info("Variant deleted successfully: {}", id);
    }

    /**
     * Alternar estado activo/inactivo
     */
    @Transactional
    public VariantResponse toggleVariantStatus(Long id) {
        log.info("Toggling variant status: {}", id);
        Variant variant = findVariantById(id);
        variant.setIsActive(!variant.getIsActive());
        Variant updated = variantRepository.save(variant);
        log.info("Variant status toggled: {} -> {}", id, updated.getIsActive());
        return variantMapper.toResponseWithOrders(updated, hasOrders(id));
    }

    /**
     * Obtener variantes con stock disponible
     */
    public PageResponse<VariantWithStockResponse> getVariantsWithStock(String search, Pageable pageable) {
        log.debug("Getting variants with stock - search: {}, page: {}", search, pageable.getPageNumber());

        Page<Variant> page = (search != null && !search.isBlank())
                ? variantRepository.searchVariants(search.trim(), pageable)
                : variantRepository.findAll(pageable);

        List<VariantWithStockResponse> content = page.getContent().stream()
                .filter(Variant::getIsActive)
                .map(variant -> {
                    Integer availableStock = stockRepository.getTotalAvailableStockByVariant(variant.getId());
                    if (availableStock == null) {
                        availableStock = 0;
                    }
                    return new VariantWithStockResponse(
                            variant.getId(),
                            variant.getProductId(),
                            variant.getSku(),
                            variant.getPrice(),
                            variant.getAttributes(),
                            variant.getIsActive(),
                            availableStock,
                            variant.getCreatedAt(),
                            variant.getUpdatedAt());
                })
                .filter(v -> v.availableStock() > 0)
                .toList();

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                (long) content.size(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Método auxiliar para buscar variante por ID
     */
    private Variant findVariantById(Long id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variante no encontrada con ID: " + id));
    }

    /**
     * Verifica si una variante tiene pedidos asociados
     */
    public boolean hasOrders(Long variantId) {
        return !orderItemRepository.findByVariantId(variantId).isEmpty();
    }

    /**
     * Eliminar variante físicamente (hard delete)
     * Solo se permite si la variante no tiene pedidos asociados
     */
    @Transactional
    public void hardDeleteVariant(Long id) {
        log.info("Hard deleting variant: {}", id);
        Variant variant = findVariantById(id);
        
        if (hasOrders(id)) {
            throw new IllegalStateException("No se puede eliminar la variante porque tiene pedidos asociados");
        }
        
        // Delete associated stocks first
        stockRepository.deleteByVariantId(id);
        
        // Delete the variant
        variantRepository.delete(variant);
        log.info("Variant hard deleted successfully: {}", id);
    }
}
