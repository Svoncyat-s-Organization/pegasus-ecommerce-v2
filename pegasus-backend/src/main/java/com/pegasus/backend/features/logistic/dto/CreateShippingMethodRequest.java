package com.pegasus.backend.features.logistic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateShippingMethodRequest {

    @NotBlank(message = "El nombre es requerido")
    private String name;

    @NotBlank(message = "La descripción es requerida")
    private String description;

    @NotBlank(message = "El transportista es requerido")
    private String carrier;

    @NotNull(message = "Los días mínimos estimados son requeridos")
    @Positive(message = "Los días mínimos deben ser positivos")
    private Integer estimatedDaysMin;

    @NotNull(message = "Los días máximos estimados son requeridos")
    @Positive(message = "Los días máximos deben ser positivos")
    private Integer estimatedDaysMax;

    @NotNull(message = "El costo base es requerido")
    @Positive(message = "El costo base debe ser positivo")
    private BigDecimal baseCost;

    @NotNull(message = "El costo por kg es requerido")
    @Positive(message = "El costo por kg debe ser positivo")
    private BigDecimal costPerKg;
}
