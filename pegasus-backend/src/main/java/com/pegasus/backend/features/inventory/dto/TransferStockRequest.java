package com.pegasus.backend.features.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para transferencia de stock entre almacenes
 */
public record TransferStockRequest(
        @NotNull(message = "El ID de la variante es requerido")
        Long variantId,

        @NotNull(message = "El ID del almacén de origen es requerido")
        Long fromWarehouseId,

        @NotNull(message = "El ID del almacén de destino es requerido")
        Long toWarehouseId,

        @NotNull(message = "La cantidad es requerida")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer quantity,

        String reason
) {}
