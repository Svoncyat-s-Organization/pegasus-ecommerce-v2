package com.pegasus.backend.features.rma.dto;

import com.pegasus.backend.shared.enums.RefundMethod;
import com.pegasus.backend.shared.enums.RmaReason;
import com.pegasus.backend.shared.enums.RmaStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO de respuesta resumido para listados de RMAs
 * No incluye items ni historial completo
 */
public record RmaSummaryResponse(
        Long id,
        String rmaNumber,
        Long orderId,
        String orderNumber,
        Long customerId,
        String customerName,
        RmaStatus status,
        RmaReason reason,
        RefundMethod refundMethod,
        BigDecimal refundAmount,
        Integer itemsCount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
