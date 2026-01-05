package com.pegasus.backend.features.inventory.controller;

import com.pegasus.backend.features.inventory.dto.MovementResponse;
import com.pegasus.backend.features.inventory.service.MovementService;
import com.pegasus.backend.shared.enums.OperationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

/**
 * Controlador REST para consulta de movimientos de inventario
 */
@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
@Tag(name = "Movements", description = "Consulta de movimientos de inventario")
public class MovementController {

    private final MovementService movementService;

    @GetMapping("/search")
    @Operation(summary = "Buscar movimientos con filtros")
    public ResponseEntity<Page<MovementResponse>> searchMovements(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long variantId,
            @RequestParam(required = false) OperationType operationType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate,
            Pageable pageable) {
        return ResponseEntity.ok(movementService.searchMovements(
                warehouseId, variantId, operationType, fromDate, toDate, pageable));
    }

    @GetMapping("/variant/{variantId}")
    @Operation(summary = "Obtener movimientos de una variante")
    public ResponseEntity<Page<MovementResponse>> getMovementsByVariant(
            @PathVariable Long variantId,
            Pageable pageable) {
        return ResponseEntity.ok(movementService.getMovementsByVariant(variantId, pageable));
    }

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Obtener movimientos de un almacén")
    public ResponseEntity<Page<MovementResponse>> getMovementsByWarehouse(
            @PathVariable Long warehouseId,
            Pageable pageable) {
        return ResponseEntity.ok(movementService.getMovementsByWarehouse(warehouseId, pageable));
    }

    @GetMapping("/reference")
    @Operation(summary = "Obtener movimientos por referencia (e.g., orderId)")
    public ResponseEntity<Page<MovementResponse>> getMovementsByReference(
            @RequestParam Long referenceId,
            @RequestParam String referenceTable,
            Pageable pageable) {
        return ResponseEntity.ok(movementService.getMovementsByReference(
                referenceId, referenceTable, pageable));
    }
}
