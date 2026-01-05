package com.pegasus.backend.shared.enums;

/**
 * Enum para estados de pedidos
 * Representa el ciclo de vida completo de una orden
 */
public enum OrderStatus {
    PENDING,        // Pendiente (creado pero sin confirmar)
    AWAIT_PAYMENT,  // Esperando pago
    PAID,           // Pagado
    PROCESSING,     // En proceso (preparando el pedido)
    SHIPPED,        // Enviado
    DELIVERED,      // Entregado
    CANCELLED,      // Cancelado
    REFUNDED        // Reembolsado
}
