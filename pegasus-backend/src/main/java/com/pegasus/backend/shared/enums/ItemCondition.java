package com.pegasus.backend.shared.enums;

/**
 * Enum para condición de items devueltos
 * Determina si el producto puede ser revendido (restock)
 */
public enum ItemCondition {
    UNOPENED,       // Sin abrir (sellado) - 100% restock
    OPENED_UNUSED,  // Abierto pero sin usar - 100% restock
    USED_LIKE_NEW,  // Usado con mínimo desgaste - Restock con descuento
    USED_GOOD,      // Usado con desgaste normal - Depende
    DAMAGED,        // Daño físico visible - No restock
    DEFECTIVE       // No funciona correctamente - No restock
}
