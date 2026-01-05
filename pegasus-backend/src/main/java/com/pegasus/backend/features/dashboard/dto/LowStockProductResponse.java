package com.pegasus.backend.features.dashboard.dto;

/**
 * Producto con stock bajo (alerta de inventario)
 *
 * @param variantId ID de la variante
 * @param productName Nombre del producto
 * @param variantSku SKU de la variante
 * @param warehouseName Nombre del almacén
 * @param currentStock Stock actual disponible
 * @param reservedStock Stock reservado
 * @param availableStock Stock disponible (current - reserved)
 */
public record LowStockProductResponse(
        Long variantId,
        String productName,
        String variantSku,
        String warehouseName,
        Integer currentStock,
        Integer reservedStock,
        Integer availableStock
) {}
