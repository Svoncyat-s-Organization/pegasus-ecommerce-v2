package com.pegasus.backend.features.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Métricas de inventario para el dashboard
 *
 * @param totalProducts Total de productos en catálogo
 * @param activeProducts Productos activos
 * @param totalVariants Total de variantes
 * @param lowStockCount Cantidad de variantes con stock bajo
 * @param outOfStockCount Cantidad de variantes sin stock
 * @param totalInventoryValue Valor total del inventario (stock * precio)
 * @param lowStockProducts Lista de productos con stock bajo (máx 10)
 */
public record InventoryMetricsResponse(
        Long totalProducts,
        Long activeProducts,
        Long totalVariants,
        Long lowStockCount,
        Long outOfStockCount,
        BigDecimal totalInventoryValue,
        List<LowStockProductResponse> lowStockProducts
) {}
