package com.pegasus.backend.features.rma.dto;

import com.pegasus.backend.shared.enums.ItemCondition;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para inspeccionar un item devuelto
 * Staff evalúa la condición y decide si puede restockearse
 */
public record InspectItemRequest(
        @NotNull(message = "El ID del item RMA es requerido")
        Long rmaItemId,

        @NotNull(message = "La condición del item es requerida")
        ItemCondition itemCondition,

        @Size(max = 500, message = "Las notas de inspección no pueden exceder 500 caracteres")
        String inspectionNotes,

        @NotNull(message = "La decisión de restock es requerida")
        Boolean restockApproved
) {}
