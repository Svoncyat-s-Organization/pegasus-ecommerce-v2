package com.pegasus.backend.features.storefront.controller;

import com.pegasus.backend.features.order.dto.CreateOrderRequest;
import com.pegasus.backend.features.order.dto.OrderResponse;
import com.pegasus.backend.features.order.dto.OrderSummaryResponse;
import com.pegasus.backend.features.order.service.OrderService;
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
 * Controlador REST para operaciones del Storefront (Clientes)
 * Endpoints protegidos que requieren rol CUSTOMER
 */
@RestController
@RequestMapping("/api/storefront/orders")
@RequiredArgsConstructor
@Tag(name = "Storefront Orders", description = "Gestión de pedidos para clientes")
public class StorefrontOrderController {

        private final OrderService orderService;

        @GetMapping
        @Operation(summary = "Mis pedidos", description = "Obtener todos los pedidos del cliente autenticado")
        @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
        public ResponseEntity<PageResponse<OrderSummaryResponse>> getMyOrders(
                        Authentication authentication,
                        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
                Long customerId = (Long) authentication.getPrincipal();
                PageResponse<OrderSummaryResponse> response = orderService.getOrdersByCustomer(customerId, pageable);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}")
        @Operation(summary = "Obtener detalle de mi pedido", description = "Obtener detalle completo de un pedido del cliente autenticado")
        @ApiResponse(responseCode = "200", description = "Pedido encontrado")
        @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
        @ApiResponse(responseCode = "403", description = "No tienes permiso para ver este pedido")
        public ResponseEntity<OrderResponse> getMyOrderById(
                        @PathVariable Long id,
                        Authentication authentication) {
                Long customerId = (Long) authentication.getPrincipal();
                OrderResponse response = orderService.getOrderById(id);

                // Verificar que el pedido pertenece al cliente
                if (!response.customerId().equals(customerId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                return ResponseEntity.ok(response);
        }

        @PostMapping
        @Operation(summary = "Crear pedido", description = "Crear un nuevo pedido desde el storefront")
        @ApiResponse(responseCode = "201", description = "Pedido creado exitosamente")
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
        public ResponseEntity<OrderResponse> createOrder(
                        @Valid @RequestBody CreateOrderRequest request,
                        Authentication authentication) {
                Long customerId = (Long) authentication.getPrincipal();

                // Asegurar que el pedido se crea para el cliente autenticado
                CreateOrderRequest securedRequest = new CreateOrderRequest(
                                customerId,
                                request.items(),
                                request.shippingAddress(),
                                request.billingAddress());

                // Storefront actions are performed by a Customer, not a backoffice User.
                // Pass null to avoid referencing a non-existent users.id in audit/FK columns.
                OrderResponse response = orderService.createOrder(securedRequest, null);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }

        @PatchMapping("/{id}/cancel")
        @Operation(summary = "Cancelar mi pedido", description = "Cancelar un pedido que aún no ha sido enviado")
        @ApiResponse(responseCode = "200", description = "Pedido cancelado exitosamente")
        @ApiResponse(responseCode = "400", description = "El pedido no puede ser cancelado")
        @ApiResponse(responseCode = "403", description = "No tienes permiso para cancelar este pedido")
        public ResponseEntity<OrderResponse> cancelMyOrder(
                        @PathVariable Long id,
                        @RequestParam(required = false) String reason,
                        Authentication authentication) {
                Long customerId = (Long) authentication.getPrincipal();
                OrderResponse existingOrder = orderService.getOrderById(id);

                // Verificar que el pedido pertenece al cliente
                if (!existingOrder.customerId().equals(customerId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                // Storefront cancellation is performed by a Customer, not a backoffice User.
                OrderResponse response = orderService.cancelOrder(id, reason, null);
                return ResponseEntity.ok(response);
        }
}
