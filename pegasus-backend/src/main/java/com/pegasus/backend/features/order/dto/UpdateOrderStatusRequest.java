package com.pegasus.backend.features.order.dto;

import com.pegasus.backend.shared.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para actualizar el estado de un pedido
 */
public record UpdateOrderStatusRequest(
        @NotNull(message = "El nuevo estado es requerido")
        OrderStatus newStatus,

        String comments
) {}
