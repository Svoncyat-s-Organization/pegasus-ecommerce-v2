package com.pegasus.backend.features.inventory.controller;

import com.pegasus.backend.features.inventory.dto.CreateWarehouseRequest;
import com.pegasus.backend.features.inventory.dto.UpdateWarehouseRequest;
import com.pegasus.backend.features.inventory.dto.WarehouseResponse;
import com.pegasus.backend.features.inventory.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de almacenes
 */
@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "Gestión de almacenes")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping("/search")
    @Operation(summary = "Buscar almacenes por nombre o código")
    public ResponseEntity<Page<WarehouseResponse>> searchWarehouses(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean isActive,
            Pageable pageable) {
        return ResponseEntity.ok(warehouseService.searchWarehouses(query, isActive, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "Obtener todos los almacenes activos")
    public ResponseEntity<List<WarehouseResponse>> getActiveWarehouses() {
        return ResponseEntity.ok(warehouseService.getActiveWarehouses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener almacén por ID")
    public ResponseEntity<WarehouseResponse> getWarehouseById(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Obtener almacén por código")
    public ResponseEntity<WarehouseResponse> getWarehouseByCode(@PathVariable String code) {
        return ResponseEntity.ok(warehouseService.getWarehouseByCode(code));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo almacén")
    public ResponseEntity<WarehouseResponse> createWarehouse(@Valid @RequestBody CreateWarehouseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseService.createWarehouse(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar almacén existente")
    public ResponseEntity<WarehouseResponse> updateWarehouse(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWarehouseRequest request) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Activar o desactivar almacén")
    public ResponseEntity<WarehouseResponse> toggleWarehouseStatus(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.toggleWarehouseStatus(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar almacén (soft delete)")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }
}
