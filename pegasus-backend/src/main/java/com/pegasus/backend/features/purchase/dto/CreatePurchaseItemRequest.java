package com.pegasus.backend.features.purchase.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreatePurchaseItemRequest(
        @NotNull(message = "Variant ID es requerido") Long variantId,

        @NotNull(message = "Cantidad es requerida") @Min(value = 1, message = "Cantidad debe ser mayor a 0") Integer quantity,

        @NotNull(message = "Costo unitario es requerido") BigDecimal unitCost) {
}
