package com.pegasus.backend.features.order.dto;

import com.pegasus.backend.shared.enums.OrderStatus;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para historial de estados del pedido
 */
public record OrderStatusHistoryResponse(
        Long id,
        OrderStatus status,
        String comments,
        Long createdBy,
        String createdByUsername,
        OffsetDateTime createdAt
) {}
