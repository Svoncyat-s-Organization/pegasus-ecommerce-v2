package com.pegasus.backend.shared.enums;

/**
 * Enum para estados de RMA (Return Merchandise Authorization)
 * Representa el ciclo de vida completo de una devolución
 */
public enum RmaStatus {
    PENDING,        // Pendiente (solicitud creada por cliente)
    APPROVED,       // Aprobada por staff
    REJECTED,       // Rechazada (motivo inválido, fuera de plazo, etc.)
    IN_TRANSIT,     // Cliente envió el paquete de vuelta
    RECEIVED,       // Warehouse recibió el paquete
    INSPECTING,     // Staff inspeccionando items
    REFUNDED,       // Reembolso procesado
    CLOSED,         // Completado (reembolso + restock si aplica)
    CANCELLED       // Cancelado por cliente o staff
}
