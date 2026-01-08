package com.pegasus.backend.features.storefront.controller;

import com.pegasus.backend.features.rma.dto.CreateRmaRequest;
import com.pegasus.backend.features.rma.dto.RmaResponse;
import com.pegasus.backend.features.rma.dto.RmaSummaryResponse;
import com.pegasus.backend.features.rma.service.RmaService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestión de RMAs en Storefront (Clientes)
 * Permite a los clientes crear solicitudes de devolución y ver el estado de sus
 * RMAs.
 * Los estados se actualizan solo desde el backoffice.
 */
@RestController
@RequestMapping("/api/storefront/rmas")
@RequiredArgsConstructor
@Tag(name = "Storefront RMAs", description = "Gestión de devoluciones para clientes")
public class StorefrontRmaController {

    private final RmaService rmaService;

    /**
     * Crear una nueva solicitud de devolución (RMA) desde el storefront.
     * El cliente puede crear RMAs para pedidos entregados.
     * La solicitud inicia en estado PENDING y debe ser aprobada desde el
     * backoffice.
     */
    @PostMapping
    @Operation(summary = "Crear solicitud de devolución", description = "Crear una nueva solicitud de devolución (RMA) para un pedido entregado")
    @ApiResponse(responseCode = "201", description = "RMA creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o el pedido no está en estado válido para devolución")
    @ApiResponse(responseCode = "403", description = "No tienes permiso para crear RMA para este pedido")
    @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    public ResponseEntity<RmaResponse> createRma(
            @Valid @RequestBody CreateRmaRequest request,
            Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();

        // Validar que el pedido pertenece al cliente (se valida dentro del servicio)
        // Los clientes crean RMAs sin necesidad de un staffUserId (será null)
        RmaResponse response = rmaService.createRmaForCustomer(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtener todas las solicitudes de devolución del cliente autenticado.
     */
    @GetMapping
    @Operation(summary = "Mis devoluciones", description = "Obtener todas las solicitudes de devolución del cliente autenticado con paginación")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<RmaSummaryResponse>> getMyRmas(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Long customerId = (Long) authentication.getPrincipal();
        PageResponse<RmaSummaryResponse> response = rmaService.getRmasByCustomer(customerId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener detalle completo de una solicitud de devolución del cliente.
     * Incluye items, historial de estados y toda la información de auditoría.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Detalle de mi devolución", description = "Obtener detalle completo de una solicitud de devolución del cliente autenticado")
    @ApiResponse(responseCode = "200", description = "RMA encontrado")
    @ApiResponse(responseCode = "404", description = "RMA no encontrado")
    @ApiResponse(responseCode = "403", description = "No tienes permiso para ver este RMA")
    public ResponseEntity<RmaResponse> getMyRmaById(
            @PathVariable Long id,
            Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        RmaResponse response = rmaService.getRmaById(id);

        // Verificar que el RMA pertenece al cliente autenticado
        if (!response.customerId().equals(customerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Obtener todas las devoluciones asociadas a un pedido específico del cliente.
     * Solo puede ver RMAs de sus propios pedidos.
     */
    @GetMapping("/by-order/{orderId}")
    @Operation(summary = "Devoluciones de un pedido", description = "Obtener todas las solicitudes de devolución asociadas a un pedido del cliente")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    @ApiResponse(responseCode = "403", description = "No tienes permiso para ver RMAs de este pedido")
    public ResponseEntity<PageResponse<RmaSummaryResponse>> getMyRmasByOrder(
            @PathVariable Long orderId,
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Long customerId = (Long) authentication.getPrincipal();

        // El servicio debe validar que el pedido pertenece al cliente
        PageResponse<RmaSummaryResponse> response = rmaService.getRmasByOrderAndCustomer(
                orderId, customerId, pageable);
        return ResponseEntity.ok(response);
    }
}
