package com.pegasus.backend.features.dashboard.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Pedido reciente para mostrar en el dashboard
 *
 * @param id ID del pedido
 * @param orderNumber Número de orden
 * @param customerName Nombre completo del cliente
 * @param total Monto total del pedido
 * @param status Estado actual del pedido
 * @param statusLabel Etiqueta en español del estado
 * @param createdAt Fecha de creación
 */
public record RecentOrderResponse(
        Long id,
        String orderNumber,
        String customerName,
        BigDecimal total,
        String status,
        String statusLabel,
        OffsetDateTime createdAt
) {}
