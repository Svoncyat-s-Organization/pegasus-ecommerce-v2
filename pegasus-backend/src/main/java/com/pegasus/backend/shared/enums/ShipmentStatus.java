package com.pegasus.backend.shared.enums;

/**
 * Estados de envío
 */
public enum ShipmentStatus {
    PENDING,        // Pendiente de envío
    PROCESSING,     // En preparación
    IN_TRANSIT,     // En tránsito
    OUT_FOR_DELIVERY, // En reparto
    DELIVERED,      // Entregado
    FAILED_ATTEMPT, // Intento fallido de entrega
    RETURNED,       // Devuelto al remitente
    CANCELLED       // Cancelado
}
