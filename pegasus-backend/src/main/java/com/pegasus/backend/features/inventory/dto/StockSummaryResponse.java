package com.pegasus.backend.features.inventory.dto;

/**
 * DTO resumido de stock para listados
 */
public record StockSummaryResponse(
        Long warehouseId,
        String warehouseCode,
        Long variantId,
        String variantSku,
        Integer quantity,
        Integer reservedQuantity,
        Integer availableQuantity
) {}
