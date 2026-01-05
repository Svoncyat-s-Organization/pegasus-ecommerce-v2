package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear una marca
 */
public record CreateBrandRequest(
        @NotBlank(message = "El nombre es requerido")
        @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
        String name,

        @NotBlank(message = "El slug es requerido")
        @Size(max = 50, message = "El slug no puede exceder 50 caracteres")
        String slug,

        @NotBlank(message = "La URL de la imagen es requerida")
        @Size(max = 255, message = "La URL no puede exceder 255 caracteres")
        String imageUrl
) {}
