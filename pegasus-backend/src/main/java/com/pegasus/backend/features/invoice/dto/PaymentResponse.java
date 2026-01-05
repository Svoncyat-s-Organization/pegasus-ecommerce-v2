package com.pegasus.backend.features.invoice.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResponse(
        Long id,
        Long orderId,
        Long paymentMethodId,
        String paymentMethodName,
        BigDecimal amount,
        String transactionId,
        OffsetDateTime paymentDate,
        String notes,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
