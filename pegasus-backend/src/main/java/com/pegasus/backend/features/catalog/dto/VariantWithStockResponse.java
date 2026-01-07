package com.pegasus.backend.features.catalog.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

/**
 * DTO de respuesta para Variant con información de stock
 */
public record VariantWithStockResponse(
        Long id,
        Long productId,
        String sku,
        BigDecimal price,
        Map<String, Object> attributes,
        Boolean isActive,
        Integer availableStock,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
