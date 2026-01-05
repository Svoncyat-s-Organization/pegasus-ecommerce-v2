package com.pegasus.backend.features.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para items del pedido en la creación
 */
public record OrderItemRequest(
        @NotNull(message = "El ID de la variante es requerido")
        Long variantId,

        @NotNull(message = "La cantidad es requerida")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer quantity
) {}
