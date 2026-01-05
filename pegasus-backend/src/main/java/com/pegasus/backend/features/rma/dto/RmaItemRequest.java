package com.pegasus.backend.features.rma.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para representar un item en una solicitud de RMA
 */
public record RmaItemRequest(
        @NotNull(message = "El ID del item de la orden es requerido")
        Long orderItemId,

        @NotNull(message = "El ID de la variante es requerido")
        Long variantId,

        @NotNull(message = "La cantidad es requerida")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer quantity
) {}
