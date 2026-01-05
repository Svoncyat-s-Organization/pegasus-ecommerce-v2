package com.pegasus.backend.features.invoice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePaymentMethodRequest(
        @NotBlank(message = "El nombre es requerido")
        @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
        String name
) {}
