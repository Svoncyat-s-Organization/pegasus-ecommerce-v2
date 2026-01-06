package com.pegasus.backend.features.dashboard.dto;

import java.math.BigDecimal;

/**
 * Métricas de clientes para el dashboard
 *
 * @param totalCustomers Total de clientes registrados
 * @param activeCustomers Clientes activos (isActive = true)
 * @param newCustomersThisMonth Nuevos clientes registrados este mes
 * @param newCustomersLastMonth Nuevos clientes del mes anterior (para comparativa)
 * @param customerGrowthPercent Variación porcentual de nuevos clientes
 */
public record CustomerMetricsResponse(
        Long totalCustomers,
        Long activeCustomers,
        Long newCustomersThisMonth,
        Long newCustomersLastMonth,
        BigDecimal customerGrowthPercent
) {}
