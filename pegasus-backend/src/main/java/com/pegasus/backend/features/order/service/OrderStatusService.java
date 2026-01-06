package com.pegasus.backend.features.order.service;

import com.pegasus.backend.features.order.entity.Order;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.shared.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Servicio para gestionar transiciones de estado de pedidos
 * Implementa lógica de negocio para cambios válidos de estado
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderStatusService {

    private final OrderRepository orderRepository;

    // Definir transiciones válidas de estado
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.AWAIT_PAYMENT, OrderStatus.CANCELLED),
            OrderStatus.AWAIT_PAYMENT, EnumSet.of(OrderStatus.PAID, OrderStatus.CANCELLED),
            OrderStatus.PAID, EnumSet.of(OrderStatus.PROCESSING, OrderStatus.REFUNDED),
            OrderStatus.PROCESSING, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED),
            OrderStatus.DELIVERED, EnumSet.of(OrderStatus.REFUNDED),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class), // Estado final
            OrderStatus.REFUNDED, EnumSet.noneOf(OrderStatus.class) // Estado final
    );

    /**
     * Cambiar estado de un pedido con validaciones
     */
    public Order changeOrderStatus(Long orderId, OrderStatus newStatus, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado: " + orderId));

        OrderStatus currentStatus = order.getStatus();

        // Validar si la transición es válida
        if (!isValidTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                    String.format("Transición inválida de %s a %s", currentStatus, newStatus));
        }

        log.info("Cambiando estado del pedido {} de {} a {}", orderId, currentStatus, newStatus);

        order.setStatus(newStatus);

        // TODO: Aquí se puede agregar lógica adicional según el nuevo estado
        // Por ejemplo: enviar notificaciones, actualizar inventario, etc.

        return orderRepository.save(order);
    }

    /**
     * Verificar si una transición de estado es válida
     */
    public boolean isValidTransition(OrderStatus from, OrderStatus to) {
        Set<OrderStatus> allowedTransitions = VALID_TRANSITIONS.get(from);
        return allowedTransitions != null && allowedTransitions.contains(to);
    }

    /**
     * Obtener estados siguientes válidos desde un estado dado
     */
    public Set<OrderStatus> getNextValidStatuses(OrderStatus currentStatus) {
        return VALID_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(OrderStatus.class));
    }

    /**
     * Avanzar al siguiente estado lógico del pedido
     */
    public Order advanceToNextStatus(Long orderId, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado: " + orderId));

        OrderStatus nextStatus = determineNextStatus(order.getStatus());
        if (nextStatus == null) {
            throw new IllegalStateException("No hay siguiente estado disponible para: " + order.getStatus());
        }

        return changeOrderStatus(orderId, nextStatus, notes);
    }

    /**
     * Determinar el siguiente estado lógico en el flujo normal
     */
    private OrderStatus determineNextStatus(OrderStatus currentStatus) {
        return switch (currentStatus) {
            case PENDING -> OrderStatus.AWAIT_PAYMENT;
            case AWAIT_PAYMENT -> OrderStatus.PAID;
            case PAID -> OrderStatus.PROCESSING;
            case PROCESSING -> OrderStatus.SHIPPED;
            case SHIPPED -> OrderStatus.DELIVERED;
            default -> null; // Estados finales o sin siguiente estado
        };
    }
}
