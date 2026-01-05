package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO para actualizar una variante
 */
public record UpdateVariantRequest(
        @Size(max = 50, message = "El SKU no puede exceder 50 caracteres")
        String sku,

        @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
        BigDecimal price,

        Map<String, Object> attributes
) {}
