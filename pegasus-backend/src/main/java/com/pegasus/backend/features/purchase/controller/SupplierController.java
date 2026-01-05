package com.pegasus.backend.features.purchase.controller;

import com.pegasus.backend.features.purchase.dto.CreateSupplierRequest;
import com.pegasus.backend.features.purchase.dto.SupplierResponse;
import com.pegasus.backend.features.purchase.dto.UpdateSupplierRequest;
import com.pegasus.backend.features.purchase.service.SupplierService;
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
@RequestMapping("/api/admin/purchases/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Gestión de proveedores")
@PreAuthorize("hasRole('ADMIN')")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Listar proveedores", description = "Obtener proveedores con paginación y búsqueda opcional")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<SupplierResponse>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(supplierService.getAll(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener proveedor", description = "Obtener proveedor por ID")
    public ResponseEntity<SupplierResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Crear proveedor", description = "Registrar un proveedor")
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar proveedor", description = "Actualizar datos del proveedor")
    public ResponseEntity<SupplierResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSupplierRequest request) {
        return ResponseEntity.ok(supplierService.update(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle estado", description = "Activar/desactivar proveedor")
    public ResponseEntity<Void> toggleStatus(@PathVariable Long id) {
        supplierService.toggleStatus(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar proveedor", description = "Eliminar proveedor permanentemente")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
