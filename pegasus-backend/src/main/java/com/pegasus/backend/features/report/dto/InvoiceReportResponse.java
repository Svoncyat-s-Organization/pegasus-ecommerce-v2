package com.pegasus.backend.features.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Reporte de facturación (documentos emitidos)
 */
public record InvoiceReportResponse(
        LocalDate startDate,
        LocalDate endDate,
        Long totalInvoices,
        Long totalBills,
        BigDecimal totalTaxAmount,
        BigDecimal totalAmount,
        List<InvoiceRow> documents
) {
    public record InvoiceRow(
            Long id,
            String type,
            String series,
            String number,
            OffsetDateTime issuedAt,
            String receiverTaxId,
            String receiverName,
            BigDecimal subtotal,
            BigDecimal taxAmount,
            BigDecimal totalAmount,
            String status
    ) {}
}
