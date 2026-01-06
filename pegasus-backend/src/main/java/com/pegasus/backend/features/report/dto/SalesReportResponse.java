package com.pegasus.backend.features.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Reporte de ventas por período
 */
public record SalesReportResponse(
        LocalDate startDate,
        LocalDate endDate,
        Long totalOrders,
        BigDecimal totalSales,
        BigDecimal averageTicket,
        List<SalesRow> details
) {
    public record SalesRow(
            LocalDate date,
            Long orders,
            BigDecimal sales
    ) {}
}
