package com.pegasus.backend.features.invoice.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CreatePaymentRequest(
        @NotNull(message = "El orderId es requerido")
        Long orderId,

        @NotNull(message = "El paymentMethodId es requerido")
        Long paymentMethodId,

        @NotNull(message = "El monto es requerido")
        @DecimalMin(value = "0.01", inclusive = true, message = "El monto debe ser mayor a 0")
        BigDecimal amount,

        @Size(max = 100, message = "El transactionId no puede exceder 100 caracteres")
        String transactionId,

        OffsetDateTime paymentDate,

        String notes
) {}
