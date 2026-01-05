package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear una imagen
 */
public record CreateImageRequest(
        @NotBlank(message = "La URL de la imagen es requerida")
        @Size(max = 255, message = "La URL no puede exceder 255 caracteres")
        String imageUrl,

        @NotNull(message = "El ID del producto es requerido")
        Long productId,

        Long variantId,

        Boolean isPrimary,

        @Min(value = 0, message = "El orden debe ser mayor o igual a 0")
        Integer displayOrder
) {}
