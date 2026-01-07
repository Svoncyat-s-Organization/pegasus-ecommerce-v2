package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.Size;

/**
 * DTO para actualizar una categoría
 */
public record UpdateCategoryRequest(
        String name,

        String slug,

        @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
        String description,

        String imageUrl,

        Long parentId
) {}
