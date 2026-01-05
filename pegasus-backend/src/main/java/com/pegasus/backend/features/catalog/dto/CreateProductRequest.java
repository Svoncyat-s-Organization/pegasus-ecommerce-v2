package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

/**
 * DTO para crear un producto
 */
public record CreateProductRequest(
        @NotBlank(message = "El código es requerido")
        @Size(max = 50, message = "El código no puede exceder 50 caracteres")
        String code,

        @NotBlank(message = "El nombre es requerido")
        @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
        String name,

        @NotBlank(message = "El slug es requerido")
        @Size(max = 50, message = "El slug no puede exceder 50 caracteres")
        String slug,

        String description,

        Long brandId,

        @NotNull(message = "La categoría es requerida")
        Long categoryId,

        Map<String, Object> specs,

        Boolean isFeatured
) {}
