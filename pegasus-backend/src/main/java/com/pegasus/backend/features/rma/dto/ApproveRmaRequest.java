package com.pegasus.backend.features.rma.dto;

import com.pegasus.backend.shared.enums.RmaStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para aprobar o rechazar una RMA
 */
public record ApproveRmaRequest(
        @NotNull(message = "La decisión es requerida")
        Boolean approved,

        @Size(max = 1000, message = "Los comentarios no pueden exceder 1000 caracteres")
        String comments
) {}
