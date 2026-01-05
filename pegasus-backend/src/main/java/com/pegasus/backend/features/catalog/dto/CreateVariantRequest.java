package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO para crear una variante
 */
public record CreateVariantRequest(
        @NotNull(message = "El ID del producto es requerido")
        Long productId,

        @NotBlank(message = "El SKU es requerido")
        @Size(max = 50, message = "El SKU no puede exceder 50 caracteres")
        String sku,

        @NotNull(message = "El precio es requerido")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
        BigDecimal price,

        Map<String, Object> attributes
) {}
