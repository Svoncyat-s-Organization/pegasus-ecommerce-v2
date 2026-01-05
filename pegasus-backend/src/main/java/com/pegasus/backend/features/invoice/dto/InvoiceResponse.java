package com.pegasus.backend.features.invoice.dto;

import com.pegasus.backend.features.invoice.entity.InvoiceStatus;
import com.pegasus.backend.features.invoice.entity.InvoiceType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record InvoiceResponse(
        Long id,
        Long orderId,
        InvoiceType invoiceType,
        String series,
        String number,
        String receiverTaxId,
        String receiverName,
        BigDecimal subtotal,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        InvoiceStatus status,
        OffsetDateTime issuedAt,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
