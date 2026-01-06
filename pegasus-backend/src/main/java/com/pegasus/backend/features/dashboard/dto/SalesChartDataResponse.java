package com.pegasus.backend.features.dashboard.dto;

import java.util.List;

/**
 * Datos para gráficos de ventas
 *
 * @param dailySales Ventas por día (últimos 30 días)
 * @param monthlySales Ventas por mes (últimos 12 meses)
 */
public record SalesChartDataResponse(
        List<ChartPointResponse> dailySales,
        List<ChartPointResponse> monthlySales
) {}
