package com.pegasus.backend.features.invoice.controller;

import com.pegasus.backend.features.invoice.dto.CreatePaymentRequest;
import com.pegasus.backend.features.invoice.dto.PaymentResponse;
import com.pegasus.backend.features.invoice.service.PaymentService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/billing/payments")
@RequiredArgsConstructor
@Tag(name = "Billing - Payments", description = "Gestión de pagos")
@PreAuthorize("hasRole('ADMIN')")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Listar pagos", description = "Obtener pagos con paginación y filtros")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<PaymentResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Long paymentMethodId,
            @PageableDefault(size = 20, sort = "paymentDate") Pageable pageable) {
        return ResponseEntity.ok(paymentService.getAll(search, orderId, paymentMethodId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener pago", description = "Obtener pago por ID")
    public ResponseEntity<PaymentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Registrar pago", description = "Registrar un pago para un pedido")
    public ResponseEntity<PaymentResponse> create(
            @Valid @RequestBody CreatePaymentRequest request,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.create(request, userId));
    }

    private Long extractUserId(Authentication authentication) {
        // TODO: Implementación real según sistema de autenticación
        return 1L;
    }
}
