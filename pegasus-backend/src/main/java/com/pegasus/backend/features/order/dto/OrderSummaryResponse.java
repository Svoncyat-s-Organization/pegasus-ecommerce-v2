package com.pegasus.backend.features.order.dto;

import com.pegasus.backend.features.invoice.entity.InvoiceType;
import com.pegasus.backend.shared.enums.DocumentType;
import com.pegasus.backend.shared.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO de respuesta resumido para pedidos
 * Usado en listados (sin items ni historial)
 */
public record OrderSummaryResponse(
                Long id,
                String orderNumber,
                Long customerId,
                String customerName,
                String customerEmail,
                DocumentType customerDocType,
                String customerDocNumber,
                OrderStatus status,
                BigDecimal total,
                InvoiceType preferredInvoiceType,
                OffsetDateTime createdAt,
                OffsetDateTime updatedAt,
                com.pegasus.backend.features.invoice.dto.InvoiceSummaryResponse invoice) {
}
