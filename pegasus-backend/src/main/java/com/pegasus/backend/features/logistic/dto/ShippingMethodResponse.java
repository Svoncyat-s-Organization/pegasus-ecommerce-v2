package com.pegasus.backend.features.logistic.dto;

import java.math.BigDecimal;

public record ShippingMethodResponse(
        Long id,
        String name,
        String description,
        String carrier,
        Integer estimatedDaysMin,
        Integer estimatedDaysMax,
        BigDecimal baseCost,
        BigDecimal costPerKg,
        Boolean isActive) {
}
