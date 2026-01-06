package com.pegasus.backend.features.dashboard.dto;

import java.math.BigDecimal;

/**
 * Métricas de compras (adquisiciones) para el dashboard
 *
 * @param totalPurchasesThisMonth Total de compras este mes
 * @param purchaseAmountThisMonth Monto total de compras este mes
 * @param pendingPurchases Compras pendientes de recepción
 * @param totalPurchasesLastMonth Total de compras mes anterior
 * @param purchaseGrowthPercent Variación porcentual vs mes anterior
 */
public record PurchaseMetricsResponse(
        Long totalPurchasesThisMonth,
        BigDecimal purchaseAmountThisMonth,
        Long pendingPurchases,
        Long totalPurchasesLastMonth,
        BigDecimal purchaseGrowthPercent
) {}
