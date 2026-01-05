package com.pegasus.backend.features.inventory.dto;

/**
 * DTO para verificar disponibilidad de stock
 */
public record StockAvailabilityResponse(
        Long variantId,
        String variantSku,
        Long warehouseId,
        String warehouseCode,
        Integer totalQuantity,
        Integer reservedQuantity,
        Integer availableQuantity,
        Boolean isAvailable,
        String message
) {}
