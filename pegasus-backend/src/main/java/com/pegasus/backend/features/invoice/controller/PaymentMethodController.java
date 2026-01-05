package com.pegasus.backend.features.invoice.controller;

import com.pegasus.backend.features.invoice.dto.CreatePaymentMethodRequest;
import com.pegasus.backend.features.invoice.dto.PaymentMethodResponse;
import com.pegasus.backend.features.invoice.dto.UpdatePaymentMethodRequest;
import com.pegasus.backend.features.invoice.service.PaymentMethodService;
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
@RequestMapping("/api/admin/billing/payment-methods")
@RequiredArgsConstructor
@Tag(name = "Billing - Payment Methods", description = "Catálogo de métodos de pago")
@PreAuthorize("hasRole('ADMIN')")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    @Operation(summary = "Listar métodos de pago", description = "Obtener métodos de pago con paginación y búsqueda opcional")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<PaymentMethodResponse>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(paymentMethodService.getAll(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener método de pago", description = "Obtener método de pago por ID")
    public ResponseEntity<PaymentMethodResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentMethodService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Crear método de pago", description = "Crear un nuevo método de pago")
    public ResponseEntity<PaymentMethodResponse> create(@Valid @RequestBody CreatePaymentMethodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentMethodService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar método de pago", description = "Actualizar el nombre del método de pago")
    public ResponseEntity<PaymentMethodResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePaymentMethodRequest request
    ) {
        return ResponseEntity.ok(paymentMethodService.update(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Activar/Desactivar", description = "Alternar estado activo/inactivo")
    public ResponseEntity<PaymentMethodResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(paymentMethodService.toggleStatus(id));
    }
}
