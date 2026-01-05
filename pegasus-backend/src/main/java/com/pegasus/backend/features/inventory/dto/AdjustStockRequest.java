package com.pegasus.backend.features.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para ajuste manual de stock
 */
public record AdjustStockRequest(
        @NotNull(message = "El ID de la variante es requerido")
        Long variantId,

        @NotNull(message = "El ID del almacén es requerido")
        Long warehouseId,

        @NotNull(message = "La cantidad de cambio es requerida")
        Integer quantityChange, // Puede ser negativo

        @NotBlank(message = "La razón del ajuste es requerida")
        String reason
) {}
