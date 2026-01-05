package com.pegasus.backend.features.rma.dto;

import com.pegasus.backend.shared.enums.RefundMethod;
import com.pegasus.backend.shared.enums.RmaStatus;
import jakarta.validation.constraints.Size;

/**
 * DTO para actualizar una RMA existente
 * Staff puede actualizar notas, método de reembolso, etc.
 */
public record UpdateRmaRequest(
        RmaStatus status,

        @Size(max = 1000, message = "Las notas no pueden exceder 1000 caracteres")
        String staffNotes,

        RefundMethod refundMethod
) {}
