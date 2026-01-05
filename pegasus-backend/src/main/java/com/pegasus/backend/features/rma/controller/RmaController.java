package com.pegasus.backend.features.rma.controller;

import com.pegasus.backend.features.rma.dto.*;
import com.pegasus.backend.features.rma.service.RmaApprovalService;
import com.pegasus.backend.features.rma.service.RmaInspectionService;
import com.pegasus.backend.features.rma.service.RmaRefundService;
import com.pegasus.backend.features.rma.service.RmaService;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.RmaStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de RMAs (Devoluciones)
 * Endpoints para backoffice (administradores y staff)
 */
@RestController
@RequestMapping("/api/admin/rmas")
@RequiredArgsConstructor
@Tag(name = "RMAs", description = "Gestión de devoluciones (Return Merchandise Authorization)")
public class RmaController {

    private final RmaService rmaService;
    private final RmaApprovalService rmaApprovalService;
    private final RmaInspectionService rmaInspectionService;
    private final RmaRefundService rmaRefundService;

    // ==================== CRUD BÁSICO ====================

    @GetMapping
    @Operation(
            summary = "Listar RMAs",
            description = "Obtener todos los RMAs con paginación y filtros opcionales"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<RmaSummaryResponse>> getAllRmas(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RmaStatus status,
            @RequestParam(required = false) Long customerId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        PageResponse<RmaSummaryResponse> response = rmaService.getAllRmas(
                search, status, customerId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener RMA por ID",
            description = "Obtener detalle completo de un RMA incluyendo items e historial"
    )
    @ApiResponse(responseCode = "200", description = "RMA encontrado")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> getRmaById(@PathVariable Long id) {
        RmaResponse response = rmaService.getRmaById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-number/{rmaNumber}")
    @Operation(
            summary = "Obtener RMA por número",
            description = "Buscar RMA por su número único (ej: RMA-2026-00001)"
    )
    @ApiResponse(responseCode = "200", description = "RMA encontrado")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> getRmaByNumber(@PathVariable String rmaNumber) {
        RmaResponse response = rmaService.getRmaByNumber(rmaNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-customer/{customerId}")
    @Operation(
            summary = "Obtener RMAs de un cliente",
            description = "Listar todas las devoluciones solicitadas por un cliente específico"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    public ResponseEntity<PageResponse<RmaSummaryResponse>> getRmasByCustomer(
            @PathVariable Long customerId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        PageResponse<RmaSummaryResponse> response = rmaService.getRmasByCustomer(
                customerId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-order/{orderId}")
    @Operation(
            summary = "Obtener RMAs de una orden",
            description = "Listar todas las devoluciones asociadas a una orden específica"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    public ResponseEntity<PageResponse<RmaSummaryResponse>> getRmasByOrder(
            @PathVariable Long orderId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        PageResponse<RmaSummaryResponse> response = rmaService.getRmasByOrder(
                orderId, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar RMA",
            description = "Actualizar información de un RMA (solo staff)"
    )
    @ApiResponse(responseCode = "200", description = "RMA actualizado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> updateRma(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRmaRequest request,
            @RequestHeader("X-User-Id") Long userId // Mock: en producción viene del JWT
    ) {
        RmaResponse response = rmaService.updateRma(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/cancel")
    @Operation(
            summary = "Cancelar RMA",
            description = "Cancelar una solicitud de devolución (cliente o staff)"
    )
    @ApiResponse(responseCode = "200", description = "RMA cancelado exitosamente")
    @ApiResponse(responseCode = "400", description = "RMA no puede ser cancelado")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> cancelRma(
            @PathVariable Long id,
            @RequestParam(required = false) String comments,
            @RequestHeader("X-User-Id") Long userId
    ) {
        RmaResponse response = rmaService.cancelRma(id, comments, userId);
        return ResponseEntity.ok(response);
    }

    // ==================== APROBACIÓN/RECHAZO ====================

    @PostMapping("/{id}/approve")
    @Operation(
            summary = "Aprobar o rechazar RMA",
            description = "Staff aprueba o rechaza una solicitud de devolución"
    )
    @ApiResponse(responseCode = "200", description = "Decisión registrada exitosamente")
    @ApiResponse(responseCode = "400", description = "RMA no está en estado válido")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> approveOrRejectRma(
            @PathVariable Long id,
            @Valid @RequestBody ApproveRmaRequest request,
            @RequestHeader("X-User-Id") Long staffUserId
    ) {
        RmaResponse response = rmaApprovalService.approveOrRejectRma(id, request, staffUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/mark-received")
    @Operation(
            summary = "Marcar RMA como recibido",
            description = "Warehouse marca que recibió el paquete devuelto"
    )
    @ApiResponse(responseCode = "200", description = "RMA marcado como recibido")
    @ApiResponse(responseCode = "400", description = "RMA no está en estado IN_TRANSIT")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> markAsReceived(
            @PathVariable Long id,
            @RequestParam(required = false) String comments,
            @RequestHeader("X-User-Id") Long staffUserId
    ) {
        RmaResponse response = rmaApprovalService.markAsReceived(id, comments, staffUserId);
        return ResponseEntity.ok(response);
    }

    // ==================== INSPECCIÓN ====================

    @PostMapping("/items/inspect")
    @Operation(
            summary = "Inspeccionar item devuelto",
            description = "Staff inspecciona un item y evalúa su condición"
    )
    @ApiResponse(responseCode = "200", description = "Item inspeccionado exitosamente")
    @ApiResponse(responseCode = "400", description = "RMA no está en estado válido")
    @ApiResponse(responseCode = "404", description = "Item no encontrado")
    public ResponseEntity<RmaItemResponse> inspectItem(
            @Valid @RequestBody InspectItemRequest request,
            @RequestHeader("X-User-Id") Long staffUserId
    ) {
        RmaItemResponse response = rmaInspectionService.inspectItem(request, staffUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/items/uninspected")
    @Operation(
            summary = "Obtener items sin inspeccionar",
            description = "Listar items de un RMA que aún no han sido inspeccionados"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<List<RmaItemResponse>> getUninspectedItems(@PathVariable Long id) {
        List<RmaItemResponse> response = rmaInspectionService.getUninspectedItems(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/complete-inspection")
    @Operation(
            summary = "Completar inspección",
            description = "Marcar que todos los items han sido inspeccionados"
    )
    @ApiResponse(responseCode = "200", description = "Inspección completada")
    @ApiResponse(responseCode = "400", description = "Aún hay items sin inspeccionar")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> completeInspection(
            @PathVariable Long id,
            @RequestParam(required = false) String comments,
            @RequestHeader("X-User-Id") Long staffUserId
    ) {
        RmaResponse response = rmaInspectionService.completeInspection(id, comments, staffUserId);
        return ResponseEntity.ok(response);
    }

    // ==================== REEMBOLSO Y CIERRE ====================

    @PostMapping("/{id}/process-refund")
    @Operation(
            summary = "Procesar reembolso",
            description = "Procesar el reembolso al cliente"
    )
    @ApiResponse(responseCode = "200", description = "Reembolso procesado exitosamente")
    @ApiResponse(responseCode = "400", description = "RMA no está listo para reembolso")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> processRefund(
            @PathVariable Long id,
            @RequestParam(required = false) String comments,
            @RequestHeader("X-User-Id") Long staffUserId
    ) {
        RmaResponse response = rmaRefundService.processRefund(id, comments, staffUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/close")
    @Operation(
            summary = "Cerrar RMA",
            description = "Cerrar RMA (restock items aprobados y finalizar proceso)"
    )
    @ApiResponse(responseCode = "200", description = "RMA cerrado exitosamente")
    @ApiResponse(responseCode = "400", description = "Reembolso no ha sido procesado")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    public ResponseEntity<RmaResponse> closeRma(
            @PathVariable Long id,
            @RequestParam Long warehouseId,
            @RequestParam(required = false) String comments,
            @RequestHeader("X-User-Id") Long staffUserId
    ) {
        RmaResponse response = rmaRefundService.closeRma(id, warehouseId, comments, staffUserId);
        return ResponseEntity.ok(response);
    }

    // ==================== DASHBOARDS/REPORTES ====================

    @GetMapping("/awaiting-inspection")
    @Operation(
            summary = "RMAs pendientes de inspección",
            description = "Listar RMAs que han sido recibidos y esperan inspección"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<RmaSummaryResponse>> getRmasAwaitingInspection(
            @PageableDefault(size = 20, sort = "receivedAt") Pageable pageable
    ) {
        PageResponse<RmaSummaryResponse> response = rmaService.getRmasAwaitingInspection(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ready-for-refund")
    @Operation(
            summary = "RMAs listos para reembolso",
            description = "Listar RMAs inspeccionados que esperan procesamiento de reembolso"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<RmaSummaryResponse>> getRmasReadyForRefund(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        PageResponse<RmaSummaryResponse> response = rmaService.getRmasReadyForRefund(pageable);
        return ResponseEntity.ok(response);
    }
}
