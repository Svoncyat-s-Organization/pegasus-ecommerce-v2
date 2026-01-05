package com.pegasus.backend.features.rma.dto;

import com.pegasus.backend.shared.enums.RefundMethod;
import com.pegasus.backend.shared.enums.RmaReason;
import com.pegasus.backend.shared.enums.RmaStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO de respuesta completo para RMAs
 * Incluye items, historial y datos relacionados
 */
public record RmaResponse(
        Long id,
        String rmaNumber,
        Long orderId,
        String orderNumber,
        Long customerId,
        String customerName,
        String customerEmail,
        RmaStatus status,
        RmaReason reason,
        String customerComments,
        String staffNotes,
        RefundMethod refundMethod,
        BigDecimal refundAmount,
        BigDecimal restockingFee,
        BigDecimal shippingCostRefund,
        Long approvedBy,
        String approverName,
        OffsetDateTime approvedAt,
        OffsetDateTime receivedAt,
        OffsetDateTime refundedAt,
        OffsetDateTime closedAt,
        List<RmaItemResponse> items,
        List<RmaStatusHistoryResponse> statusHistories,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
