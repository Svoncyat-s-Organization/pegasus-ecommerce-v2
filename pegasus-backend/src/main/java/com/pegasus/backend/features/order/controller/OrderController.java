package com.pegasus.backend.features.order.controller;

import com.pegasus.backend.features.order.dto.*;
import com.pegasus.backend.features.order.service.OrderService;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.OrderStatus;
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

/**
 * Controlador REST para gestión de Pedidos (Orders)
 * Endpoints para backoffice (administradores)
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Gestión de pedidos")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(
            summary = "Listar pedidos",
            description = "Obtener todos los pedidos con paginación y filtros opcionales"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<OrderSummaryResponse>> getAllOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        PageResponse<OrderSummaryResponse> response = orderService.getAllOrders(search, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener pedido por ID",
            description = "Obtener detalle completo de un pedido incluyendo items e historial"
    )
    @ApiResponse(responseCode = "200", description = "Pedido encontrado")
    @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-number/{orderNumber}")
    @Operation(
            summary = "Obtener pedido por número de orden",
            description = "Buscar pedido por su número único"
    )
    @ApiResponse(responseCode = "200", description = "Pedido encontrado")
    @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    public ResponseEntity<OrderResponse> getOrderByNumber(@PathVariable String orderNumber) {
        OrderResponse response = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-customer/{customerId}")
    @Operation(
            summary = "Obtener pedidos de un cliente",
            description = "Listar todos los pedidos realizados por un cliente específico"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    public ResponseEntity<PageResponse<OrderSummaryResponse>> getOrdersByCustomer(
            @PathVariable Long customerId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        PageResponse<OrderSummaryResponse> response = orderService.getOrdersByCustomer(customerId, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(
            summary = "Crear pedido",
            description = "Crear un nuevo pedido manualmente desde el backoffice"
    )
    @ApiResponse(responseCode = "201", description = "Pedido creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Cliente o variante no encontrada")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId
    ) {
        OrderResponse response = orderService.createOrder(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(
            summary = "Actualizar estado del pedido",
            description = "Cambiar el estado de un pedido y registrar en el historial"
    )
    @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente")
    @ApiResponse(responseCode = "400", description = "Transición de estado no permitida")
    @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId
    ) {
        OrderResponse response = orderService.updateOrderStatus(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(
            summary = "Cancelar pedido",
            description = "Cancelar un pedido que aún no ha sido enviado"
    )
    @ApiResponse(responseCode = "200", description = "Pedido cancelado exitosamente")
    @ApiResponse(responseCode = "400", description = "El pedido no puede ser cancelado en su estado actual")
    @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId
    ) {
        OrderResponse response = orderService.cancelOrder(id, reason, userId);
        return ResponseEntity.ok(response);
    }
}
