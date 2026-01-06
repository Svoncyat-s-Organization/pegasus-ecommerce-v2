package com.pegasus.backend.features.dashboard.dto;

import java.math.BigDecimal;

/**
 * Métricas de ventas para el dashboard
 * Incluye datos del período actual y comparativa con período anterior
 *
 * @param totalSales Total de ventas (monto) en el período
 * @param totalOrders Número total de pedidos en el período
 * @param averageTicket Ticket promedio (totalSales / totalOrders)
 * @param salesGrowthPercent Variación porcentual vs período anterior (puede ser negativo)
 * @param ordersGrowthPercent Variación porcentual de pedidos vs período anterior
 * @param periodLabel Descripción del período (ej: "Hoy", "Esta Semana", "Este Mes")
 */
public record SalesMetricsResponse(
        BigDecimal totalSales,
        Long totalOrders,
        BigDecimal averageTicket,
        BigDecimal salesGrowthPercent,
        BigDecimal ordersGrowthPercent,
        String periodLabel
) {}
