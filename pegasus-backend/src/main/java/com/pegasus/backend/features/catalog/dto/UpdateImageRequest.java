package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * DTO para actualizar una imagen
 */
public record UpdateImageRequest(
        @Size(max = 255, message = "La URL no puede exceder 255 caracteres")
        String imageUrl,

        Boolean isPrimary,

        @Min(value = 0, message = "El orden debe ser mayor o igual a 0")
        Integer displayOrder
) {}
