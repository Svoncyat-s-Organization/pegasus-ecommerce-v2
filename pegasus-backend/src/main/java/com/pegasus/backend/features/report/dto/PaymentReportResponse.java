package com.pegasus.backend.features.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Reporte de pagos recibidos
 */
public record PaymentReportResponse(
        LocalDate startDate,
        LocalDate endDate,
        Long totalPayments,
        BigDecimal totalAmount,
        List<PaymentMethodRow> byPaymentMethod
) {
    public record PaymentMethodRow(
            Long paymentMethodId,
            String paymentMethodName,
            Long count,
            BigDecimal amount
    ) {}
}
