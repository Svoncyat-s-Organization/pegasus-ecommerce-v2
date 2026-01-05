package com.pegasus.backend.features.report.controller;

import com.pegasus.backend.features.report.dto.*;
import com.pegasus.backend.features.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Controlador de reportes contables
 */
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Reportes contables y operacionales")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    @Operation(summary = "Reporte de ventas por período")
    public ResponseEntity<SalesReportResponse> getSalesReport(
            @Parameter(description = "Fecha inicio (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Fecha fin (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getSalesReport(startDate, endDate));
    }

    @GetMapping("/invoices")
    @Operation(summary = "Reporte de facturación")
    public ResponseEntity<InvoiceReportResponse> getInvoiceReport(
            @Parameter(description = "Fecha inicio (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Fecha fin (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getInvoiceReport(startDate, endDate));
    }

    @GetMapping("/purchases")
    @Operation(summary = "Reporte de compras por proveedor")
    public ResponseEntity<PurchaseReportResponse> getPurchaseReport(
            @Parameter(description = "Fecha inicio (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Fecha fin (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getPurchaseReport(startDate, endDate));
    }

    @GetMapping("/inventory")
    @Operation(summary = "Reporte de inventario valorizado")
    public ResponseEntity<InventoryReportResponse> getInventoryReport() {
        return ResponseEntity.ok(reportService.getInventoryReport());
    }

    @GetMapping("/payments")
    @Operation(summary = "Reporte de pagos recibidos")
    public ResponseEntity<PaymentReportResponse> getPaymentReport(
            @Parameter(description = "Fecha inicio (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Fecha fin (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getPaymentReport(startDate, endDate));
    }
}
