package com.pegasus.backend.features.rma.dto;

import com.pegasus.backend.shared.enums.RmaReason;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO para crear una nueva solicitud de RMA
 * El cliente solicita devolver items de una orden
 */
public record CreateRmaRequest(
        @NotNull(message = "El ID de la orden es requerido")
        Long orderId,

        @NotNull(message = "El motivo de devolución es requerido")
        RmaReason reason,

        @Size(max = 1000, message = "Los comentarios no pueden exceder 1000 caracteres")
        String customerComments,

        @NotEmpty(message = "Debe incluir al menos un item para devolver")
        @Valid
        List<RmaItemRequest> items
) {}
