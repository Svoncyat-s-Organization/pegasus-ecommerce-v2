package com.pegasus.backend.features.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear un nuevo almacén
 */
public record CreateWarehouseRequest(
        @NotBlank(message = "El código es requerido")
        @Size(max = 50, message = "El código no debe exceder 50 caracteres")
        String code,

        @NotBlank(message = "El nombre es requerido")
        @Size(max = 100, message = "El nombre no debe exceder 100 caracteres")
        String name,

        @NotBlank(message = "El ubigeo es requerido")
        @Size(min = 6, max = 6, message = "El ubigeo debe tener 6 caracteres")
        String ubigeoId,

        @NotBlank(message = "La dirección es requerida")
        @Size(max = 255, message = "La dirección no debe exceder 255 caracteres")
        String address
) {}
