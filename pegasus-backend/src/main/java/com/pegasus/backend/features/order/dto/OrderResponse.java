package com.pegasus.backend.features.order.dto;

import com.pegasus.backend.shared.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO de respuesta completo para pedidos
 * Incluye items, historial y datos del cliente
 */
public record OrderResponse(
        Long id,
        String orderNumber,
        Long customerId,
        String customerName,
        String customerEmail,
        OrderStatus status,
        BigDecimal total,
        Map<String, Object> shippingAddress,
        Map<String, Object> billingAddress,
        List<OrderItemResponse> items,
        List<OrderStatusHistoryResponse> statusHistories,
        Long shippingMethodId,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        com.pegasus.backend.features.invoice.dto.InvoiceSummaryResponse invoice) {
}
