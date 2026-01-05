package com.pegasus.backend.features.logistic.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateShippingMethodRequest {

    private String name;
    private String description;
    private String carrier;

    @Positive(message = "Los días mínimos deben ser positivos")
    private Integer estimatedDaysMin;

    @Positive(message = "Los días máximos deben ser positivos")
    private Integer estimatedDaysMax;

    @Positive(message = "El costo base debe ser positivo")
    private BigDecimal baseCost;

    @Positive(message = "El costo por kg debe ser positivo")
    private BigDecimal costPerKg;
}
