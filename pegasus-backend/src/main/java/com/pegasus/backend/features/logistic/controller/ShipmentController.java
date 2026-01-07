package com.pegasus.backend.features.logistic.controller;

import com.pegasus.backend.features.logistic.dto.CreateShipmentRequest;
import com.pegasus.backend.features.logistic.dto.ShipmentResponse;
import com.pegasus.backend.features.logistic.dto.UpdateShipmentRequest;
import com.pegasus.backend.features.logistic.service.ShipmentService;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.ShipmentStatus;
import com.pegasus.backend.shared.enums.ShipmentType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shipments")
@RequiredArgsConstructor
@Tag(name = "Shipments", description = "Gestión de envíos")
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    @Operation(summary = "Obtener todos los envíos")
    public ResponseEntity<PageResponse<ShipmentResponse>> getAllShipments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) ShipmentType shipmentType,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(shipmentService.getAllShipments(search, status, shipmentType, pageable));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Obtener envíos por orden")
    public ResponseEntity<PageResponse<ShipmentResponse>> getShipmentsByOrder(
            @PathVariable Long orderId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(shipmentService.getShipmentsByOrder(orderId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener envío por ID")
    public ResponseEntity<ShipmentResponse> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @GetMapping("/tracking/{trackingNumber}")
    @Operation(summary = "Obtener envíos por número de tracking")
    public ResponseEntity<List<ShipmentResponse>> getShipmentsByTrackingNumber(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.getShipmentsByTrackingNumber(trackingNumber));
    }

    @PostMapping
    @Operation(summary = "Crear envío")
    public ResponseEntity<ShipmentResponse> createShipment(@Valid @RequestBody CreateShipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shipmentService.createShipment(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar envío")
    public ResponseEntity<ShipmentResponse> updateShipment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShipmentRequest request,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(shipmentService.updateShipment(id, request, userId));
    }

    @PostMapping("/{id}/mark-as-shipped")
    @Operation(summary = "Marcar envío como enviado")
    public ResponseEntity<ShipmentResponse> markAsShipped(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(shipmentService.markAsShipped(id, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar envío (soft delete)")
    public ResponseEntity<Void> deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(Authentication authentication) {
        // TODO: Implementación real según sistema de autenticación
        return 1L;
    }
}
