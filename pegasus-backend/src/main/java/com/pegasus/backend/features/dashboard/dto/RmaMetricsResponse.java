package com.pegasus.backend.features.dashboard.dto;

import java.math.BigDecimal;

/**
 * Métricas de RMA (devoluciones) para el dashboard
 *
 * @param pendingRmas RMAs pendientes de aprobación
 * @param inProgressRmas RMAs en proceso (aprobadas, en tránsito, recibidas, inspeccionando)
 * @param completedRmasThisMonth RMAs completadas este mes
 * @param totalRefundedThisMonth Monto total reembolsado este mes
 * @param returnRate Tasa de devolución (RMAs / Pedidos del período) en porcentaje
 */
public record RmaMetricsResponse(
        Long pendingRmas,
        Long inProgressRmas,
        Long completedRmasThisMonth,
        BigDecimal totalRefundedThisMonth,
        BigDecimal returnRate
) {}
