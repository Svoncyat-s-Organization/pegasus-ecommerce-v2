package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.Size;

/**
 * DTO para actualizar una marca
 */
public record UpdateBrandRequest(
        @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
        String name,

        @Size(max = 50, message = "El slug no puede exceder 50 caracteres")
        String slug,

        @Size(max = 255, message = "La URL no puede exceder 255 caracteres")
        String imageUrl
) {}
