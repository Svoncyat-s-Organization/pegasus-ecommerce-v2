package com.pegasus.backend.shared.enums;

/**
 * Enum para motivos de devolución
 * Define por qué el cliente está devolviendo el producto
 */
public enum RmaReason {
    DEFECTIVE,          // Producto defectuoso o no funciona
    WRONG_ITEM,         // Enviaron producto incorrecto
    NOT_AS_DESCRIBED,   // No coincide con descripción del sitio
    DAMAGED_SHIPPING,   // Dañado durante el envío
    CHANGED_MIND,       // Cliente se arrepintió de la compra
    SIZE_COLOR,         // Talla o color incorrecto
    LATE_DELIVERY,      // Llegó demasiado tarde
    OTHER               // Otro motivo (requiere descripción)
}
