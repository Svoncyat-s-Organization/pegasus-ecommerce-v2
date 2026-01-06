package com.pegasus.backend.features.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Reporte de compras a proveedores
 */
public record PurchaseReportResponse(
        LocalDate startDate,
        LocalDate endDate,
        Long totalPurchases,
        BigDecimal totalAmount,
        List<PurchaseRow> bySupplier
) {
    public record PurchaseRow(
            Long supplierId,
            String supplierName,
            String supplierDocNumber,
            Long purchaseCount,
            BigDecimal totalAmount
    ) {}
}
