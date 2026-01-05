package com.pegasus.backend.shared.enums;

/**
 * Enum para métodos de reembolso
 * Define cómo se devolverá el dinero al cliente
 */
public enum RefundMethod {
    ORIGINAL_PAYMENT,   // Mismo método de pago original (tarjeta, efectivo)
    BANK_TRANSFER,      // Transferencia bancaria a cuenta del cliente
    STORE_CREDIT,       // Crédito para futuras compras en la tienda
    EXCHANGE            // Intercambio por otro producto (sin dinero)
}
