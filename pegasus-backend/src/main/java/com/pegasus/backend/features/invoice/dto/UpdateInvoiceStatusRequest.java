package com.pegasus.backend.features.invoice.dto;

import com.pegasus.backend.features.invoice.entity.InvoiceStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateInvoiceStatusRequest(
        @NotNull(message = "El estado es requerido")
        InvoiceStatus status
) {}
