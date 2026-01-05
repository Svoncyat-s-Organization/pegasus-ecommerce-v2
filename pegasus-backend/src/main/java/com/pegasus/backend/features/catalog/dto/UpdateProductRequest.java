package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.Size;

import java.util.Map;

/**
 * DTO para actualizar un producto
 */
public record UpdateProductRequest(
        @Size(max = 50, message = "El código no puede exceder 50 caracteres")
        String code,

        @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
        String name,

        @Size(max = 50, message = "El slug no puede exceder 50 caracteres")
        String slug,

        String description,

        Long brandId,

        Long categoryId,

        Map<String, Object> specs,

        Boolean isFeatured
) {}
