package com.pegasus.backend.features.catalog.dto;

import com.pegasus.backend.features.catalog.entity.CategorySpecification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for updating a CategorySpecification
 */
@Data
public class UpdateCategorySpecificationRequest {

    @NotBlank(message = "El nombre interno es requerido")
    @Size(max = 50, message = "El nombre interno no puede exceder 50 caracteres")
    private String name;

    @NotBlank(message = "El nombre de visualización es requerido")
    @Size(max = 100, message = "El nombre de visualización no puede exceder 100 caracteres")
    private String displayName;

    @NotNull(message = "El tipo de especificación es requerido")
    private CategorySpecification.SpecType specType;

    @Size(max = 20, message = "La unidad no puede exceder 20 caracteres")
    private String unit;

    private List<String> options;

    private Boolean isRequired;

    private Integer position;

    private Boolean isActive;
}
