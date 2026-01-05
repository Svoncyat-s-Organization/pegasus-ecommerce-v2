package com.pegasus.backend.features.inventory.dto;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para stock
 */
public record StockResponse(
        Long id,
        Long warehouseId,
        String warehouseCode,
        String warehouseName,
        Long variantId,
        String variantSku,
        String productName,
        Integer quantity,
        Integer reservedQuantity,
        Integer availableQuantity,
        OffsetDateTime updatedAt
) {}
