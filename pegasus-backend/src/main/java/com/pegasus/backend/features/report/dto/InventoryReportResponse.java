package com.pegasus.backend.features.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Reporte de inventario valorizado
 */
public record InventoryReportResponse(
        LocalDate reportDate,
        Long totalVariants,
        Integer totalUnits,
        BigDecimal totalValue,
        List<WarehouseRow> byWarehouse
) {
    public record WarehouseRow(
            Long warehouseId,
            String warehouseName,
            Long variantCount,
            Integer units,
            BigDecimal value
    ) {}
}
