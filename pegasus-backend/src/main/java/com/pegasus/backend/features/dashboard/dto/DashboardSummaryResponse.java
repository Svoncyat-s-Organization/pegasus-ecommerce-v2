package com.pegasus.backend.features.dashboard.dto;

import java.util.List;

/**
 * Respuesta completa del dashboard
 * Agrupa todas las métricas en un solo endpoint para optimizar llamadas
 *
 * @param sales Métricas de ventas
 * @param customers Métricas de clientes
 * @param inventory Métricas de inventario
 * @param purchases Métricas de compras
 * @param rma Métricas de devoluciones
 * @param ordersByStatus Pedidos agrupados por estado
 * @param topProducts Productos más vendidos (top 5)
 * @param recentOrders Pedidos más recientes (últimos 10)
 * @param charts Datos para gráficos
 */
public record DashboardSummaryResponse(
        SalesMetricsResponse sales,
        CustomerMetricsResponse customers,
        InventoryMetricsResponse inventory,
        PurchaseMetricsResponse purchases,
        RmaMetricsResponse rma,
        List<OrdersByStatusResponse> ordersByStatus,
        List<TopProductResponse> topProducts,
        List<RecentOrderResponse> recentOrders,
        SalesChartDataResponse charts
) {}
