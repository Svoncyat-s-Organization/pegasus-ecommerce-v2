package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for saving product variant attribute assignments (batch)
 * Used when saving all attribute assignments from the product form
 */
@Data
public class SaveProductVariantAttributeRequest {

    private Long id; // null for new, populated for updates

    @NotNull(message = "El ID del atributo es requerido")
    private Long variantAttributeId;

    /**
     * Opciones personalizadas (opcional).
     * Si es null, se usan las opciones globales del atributo.
     */
    private List<String> customOptions;

    private Integer position = 0;
}
