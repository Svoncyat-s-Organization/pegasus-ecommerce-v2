package com.pegasus.backend.features.order.controller;

import com.pegasus.backend.features.logistic.dto.ShipmentResponse;
import com.pegasus.backend.features.order.dto.*;
import com.pegasus.backend.features.order.service.OrderService;
import com.pegasus.backend.features.order.service.OrderStatusService;
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
import org.springframework.security.core.Authentication;
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
        private final OrderStatusService orderStatusService;

        @GetMapping
        @Operation(summary = "Listar pedidos", description = "Obtener todos los pedidos con paginación y filtros opcionales")
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
        public ResponseEntity<PageResponse<OrderSummaryResponse>> getAllOrders(
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) OrderStatus status,
                        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
                PageResponse<OrderSummaryResponse> response = orderService.getAllOrders(search, status, pageable);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}")
        @Operation(summary = "Obtener pedido por ID", description = "Obtener detalle completo de un pedido incluyendo items e historial")
        @ApiResponse(responseCode = "200", description = "Pedido encontrado")
        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
                OrderResponse response = orderService.getOrderById(id);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/by-number/{orderNumber}")
        @Operation(summary = "Obtener pedido por número de orden", description = "Buscar pedido por su número único")
        @ApiResponse(responseCode = "200", description = "Pedido encontrado")
        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        public ResponseEntity<OrderResponse> getOrderByNumber(@PathVariable String orderNumber) {
                OrderResponse response = orderService.getOrderByNumber(orderNumber);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/by-customer/{customerId}")
        @Operation(summary = "Obtener pedidos de un cliente", description = "Listar todos los pedidos realizados por un cliente específico")
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
        @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
        public ResponseEntity<PageResponse<OrderSummaryResponse>> getOrdersByCustomer(
                        @PathVariable Long customerId,
                        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
                PageResponse<OrderSummaryResponse> response = orderService.getOrdersByCustomer(customerId, pageable);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/paid")
        @Operation(summary = "Obtener pedidos pagados listos para envío", description = "Listar pedidos con estado PAID que están listos para crear envío")
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
        public ResponseEntity<PageResponse<OrderSummaryResponse>> getPaidOrders(
                        @PageableDefault(size = 100, sort = "createdAt") Pageable pageable) {
                PageResponse<OrderSummaryResponse> response = orderService.getAllOrders(null, OrderStatus.PAID,
                                pageable);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/paid-with-invoice")
        @Operation(summary = "Obtener pedidos pagados con comprobante emitido", description = "Listar pedidos con estado PAID que ya tienen comprobante emitido (requisito para crear envíos)")
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
        public ResponseEntity<PageResponse<OrderSummaryResponse>> getPaidOrdersWithInvoice(
                        @PageableDefault(size = 100, sort = "createdAt") Pageable pageable) {
                PageResponse<OrderSummaryResponse> response = orderService.getPaidOrdersWithInvoice(pageable);
                return ResponseEntity.ok(response);
        }

        @PostMapping
        @Operation(summary = "Crear pedido", description = "Crear un nuevo pedido manualmente desde el backoffice")
        @ApiResponse(responseCode = "201", description = "Pedido creado exitosamente")
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
        @ApiResponse(responseCode = "404", description = "Cliente o variante no encontrada")
        public ResponseEntity<OrderResponse> createOrder(
                        @Valid @RequestBody CreateOrderRequest request,
                        Authentication authentication) {
                if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
                OrderResponse response = orderService.createOrder(request, userId);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        @PatchMapping("/{id}/status")
        @Operation(summary = "Actualizar estado del pedido", description = "Cambiar el estado de un pedido y registrar en el historial")
        @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente")
        @ApiResponse(responseCode = "400", description = "Transición de estado no permitida")
        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        public ResponseEntity<OrderResponse> updateOrderStatus(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateOrderStatusRequest request,
                        Authentication authentication) {
                if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
                OrderResponse response = orderService.updateOrderStatus(id, request, userId);
                return ResponseEntity.ok(response);
        }

        @PatchMapping("/{id}/cancel")
        @Operation(summary = "Cancelar pedido", description = "Cancelar un pedido que aún no ha sido enviado")
        @ApiResponse(responseCode = "200", description = "Pedido cancelado exitosamente")
        @ApiResponse(responseCode = "400", description = "El pedido no puede ser cancelado en su estado actual")
        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        public ResponseEntity<OrderResponse> cancelOrder(
                        @PathVariable Long id,
                        @RequestParam(required = false) String reason,
                        Authentication authentication) {
                if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
                OrderResponse response = orderService.cancelOrder(id, reason, userId);
                return ResponseEntity.ok(response);
        }

        @PostMapping("/{orderId}/shipments")
        @Operation(summary = "Crear envío para un pedido", description = "Crear un envío manualmente para un pedido cuando el cliente tiene problemas en el storefront")
        @ApiResponse(responseCode = "201", description = "Envío creado exitosamente")
        @ApiResponse(responseCode = "400", description = "El pedido no está en estado válido para crear envíos")
        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        public ResponseEntity<ShipmentResponse> createShipmentForOrder(
                        @PathVariable Long orderId,
                        @Valid @RequestBody CreateShipmentForOrderRequest request) {
                ShipmentResponse response = orderService.createShipmentForOrder(orderId, request);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        @PostMapping("/{id}/advance-status")
        @Operation(summary = "Avanzar al siguiente estado", description = "Avanzar automáticamente al siguiente estado lógico en el flujo del pedido")
        @ApiResponse(responseCode = "200", description = "Estado avanzado exitosamente")
        @ApiResponse(responseCode = "400", description = "No hay siguiente estado disponible")
        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        public ResponseEntity<OrderResponse> advanceOrderStatus(
                        @PathVariable Long id,
                        @RequestParam(required = false) String notes) {
                orderStatusService.advanceToNextStatus(id, notes);
                OrderResponse response = orderService.getOrderById(id);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}/next-statuses")
        @Operation(summary = "Obtener estados siguientes válidos", description = "Obtener lista de estados a los que puede transicionar el pedido actual")
        @ApiResponse(responseCode = "200", description = "Lista de estados válidos")
        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        public ResponseEntity<java.util.Set<OrderStatus>> getNextValidStatuses(@PathVariable Long id) {
                OrderResponse order = orderService.getOrderById(id);
                java.util.Set<OrderStatus> nextStatuses = orderStatusService.getNextValidStatuses(order.status());
                return ResponseEntity.ok(nextStatuses);
        }
}
