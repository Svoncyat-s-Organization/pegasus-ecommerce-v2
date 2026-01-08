package com.pegasus.backend.features.catalog.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

/**
 * DTO de respuesta para Variant
 */
public record VariantResponse(
        Long id,
        Long productId,
        String sku,
        BigDecimal price,
        Map<String, Object> attributes,
        Boolean isActive,
        Boolean hasOrders,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
