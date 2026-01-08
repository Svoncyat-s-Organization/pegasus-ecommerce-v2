package com.pegasus.backend.features.catalog.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for assigning a variant attribute to a product
 */
@Data
public class AssignVariantAttributeRequest {

    @NotNull(message = "El ID del atributo es requerido")
    private Long variantAttributeId;

    /**
     * Opciones personalizadas (opcional).
     * Si es null, se usan las opciones globales del atributo.
     */
    private List<String> customOptions;

    private Integer position = 0;
}
