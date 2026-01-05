package com.pegasus.backend.features.invoice.dto;

import com.pegasus.backend.features.invoice.entity.InvoiceStatus;
import com.pegasus.backend.features.invoice.entity.InvoiceType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record InvoiceSummaryResponse(
        Long id,
        Long orderId,
        InvoiceType invoiceType,
        String series,
        String number,
        BigDecimal totalAmount,
        InvoiceStatus status,
        OffsetDateTime issuedAt) {
}
