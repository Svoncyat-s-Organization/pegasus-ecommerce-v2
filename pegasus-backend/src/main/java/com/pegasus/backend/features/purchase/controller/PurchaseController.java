package com.pegasus.backend.features.purchase.controller;

import com.pegasus.backend.features.purchase.dto.CreatePurchaseRequest;
import com.pegasus.backend.features.purchase.dto.PurchaseResponse;
import com.pegasus.backend.features.purchase.dto.UpdatePurchaseStatusRequest;
import com.pegasus.backend.features.purchase.service.PurchaseService;
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
@RequestMapping("/api/admin/purchases")
@RequiredArgsConstructor
@Tag(name = "Purchases", description = "Gestión de compras")
@PreAuthorize("hasRole('ADMIN')")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @GetMapping
    @Operation(summary = "Listar compras", description = "Obtener compras con paginación y búsqueda opcional")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<PurchaseResponse>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(purchaseService.getAll(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener compra", description = "Obtener compra por ID")
    public ResponseEntity<PurchaseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Crear compra", description = "Registrar una compra con sus items")
    public ResponseEntity<PurchaseResponse> create(@Valid @RequestBody CreatePurchaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.create(request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Actualizar estado", description = "Actualizar estado de una compra")
    public ResponseEntity<PurchaseResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePurchaseStatusRequest request) {
        return ResponseEntity.ok(purchaseService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar compra", description = "Eliminar compra permanentemente")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        purchaseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
