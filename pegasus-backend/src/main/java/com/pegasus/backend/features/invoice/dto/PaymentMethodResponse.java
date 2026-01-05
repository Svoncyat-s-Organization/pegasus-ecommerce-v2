package com.pegasus.backend.features.invoice.dto;

import java.time.OffsetDateTime;

public record PaymentMethodResponse(
        Long id,
        String name,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
