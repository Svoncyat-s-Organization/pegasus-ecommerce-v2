package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear una categoría
 */
public record CreateCategoryRequest(
        @NotBlank(message = "El nombre es requerido")
        String name,

        @NotBlank(message = "El slug es requerido")
        String slug,

        @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
        String description,

        String imageUrl,

        Long parentId
) {}
