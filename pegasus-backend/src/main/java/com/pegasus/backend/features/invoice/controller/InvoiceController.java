package com.pegasus.backend.features.invoice.controller;

import com.pegasus.backend.features.invoice.dto.*;
import com.pegasus.backend.features.invoice.entity.InvoiceStatus;
import com.pegasus.backend.features.invoice.service.InvoiceService;
import com.pegasus.backend.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/billing/invoices")
@RequiredArgsConstructor
@Tag(name = "Billing - Invoices", description = "Gestión de comprobantes")
@PreAuthorize("hasRole('ADMIN')")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @Operation(summary = "Listar comprobantes", description = "Obtener comprobantes con paginación y filtros")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<InvoiceSummaryResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) InvoiceStatus status,
            @PageableDefault(size = 20, sort = "issuedAt") Pageable pageable
    ) {
        return ResponseEntity.ok(invoiceService.getAll(search, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener comprobante", description = "Obtener comprobante por ID")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @GetMapping("/by-order/{orderId}")
    @Operation(summary = "Obtener por pedido", description = "Obtener comprobante por orderId")
    public ResponseEntity<InvoiceResponse> getByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(invoiceService.getByOrderId(orderId));
    }

    @GetMapping("/by-series-number")
    @Operation(summary = "Obtener por serie y número", description = "Buscar comprobante por serie y número")
    public ResponseEntity<InvoiceResponse> getBySeriesAndNumber(
            @RequestParam String series,
            @RequestParam String number
    ) {
        return ResponseEntity.ok(invoiceService.getBySeriesAndNumber(series.trim(), number.trim()));
    }

    @PostMapping
    @Operation(summary = "Crear comprobante", description = "Registrar un comprobante manualmente")
    public ResponseEntity<InvoiceResponse> create(@Valid @RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.create(request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Actualizar estado", description = "Actualizar estado del comprobante")
    public ResponseEntity<InvoiceResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInvoiceStatusRequest request
    ) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, request));
    }
}
