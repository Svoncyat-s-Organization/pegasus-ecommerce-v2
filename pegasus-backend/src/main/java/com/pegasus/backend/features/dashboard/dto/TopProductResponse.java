package com.pegasus.backend.features.dashboard.dto;

import java.math.BigDecimal;

/**
 * Producto más vendido
 *
 * @param productId ID del producto
 * @param productName Nombre del producto
 * @param productCode Código del producto
 * @param variantSku SKU de la variante más vendida
 * @param totalQuantity Cantidad total vendida
 * @param totalRevenue Ingresos totales generados
 */
public record TopProductResponse(
        Long productId,
        String productName,
        String productCode,
        String variantSku,
        Long totalQuantity,
        BigDecimal totalRevenue
) {}
