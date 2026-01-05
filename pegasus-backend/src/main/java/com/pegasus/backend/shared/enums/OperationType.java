package com.pegasus.backend.shared.enums;

/**
 * Enum para tipos de operaciones de inventario
 * Define los diferentes movimientos que pueden afectar el stock
 */
public enum OperationType {
    INVENTORY_ADJUSTMENT,  // Ajuste manual de inventario
    PURCHASE,             // Entrada por compra a proveedor
    SALE,                 // Salida por venta a cliente
    RETURN,               // Devolución (entrada)
    CANCELLATION,         // Cancelación de venta (reingreso)
    TRANSFER_IN,          // Transferencia entrante desde otro almacén
    TRANSFER_OUT          // Transferencia saliente hacia otro almacén
}
