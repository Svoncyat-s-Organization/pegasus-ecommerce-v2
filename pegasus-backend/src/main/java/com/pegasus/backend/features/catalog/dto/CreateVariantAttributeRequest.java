package com.pegasus.backend.features.catalog.dto;

import com.pegasus.backend.features.catalog.entity.VariantAttribute;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Request DTO for creating a VariantAttribute
 */
@Data
public class CreateVariantAttributeRequest {

    @NotBlank(message = "El nombre interno es requerido")
    @Size(max = 50, message = "El nombre interno no puede exceder 50 caracteres")
    private String name;

    @NotBlank(message = "El nombre de visualización es requerido")
    @Size(max = 100, message = "El nombre de visualización no puede exceder 100 caracteres")
    private String displayName;

    @NotNull(message = "El tipo de atributo es requerido")
    private VariantAttribute.AttributeType attributeType;

    @NotNull(message = "Las opciones son requeridas")
    private List<String> options = new ArrayList<>();

    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String description;
}
