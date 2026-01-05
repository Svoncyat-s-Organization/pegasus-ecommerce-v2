package com.pegasus.backend.features.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO para crear un nuevo pedido
 */
public record CreateOrderRequest(
        @NotNull(message = "El ID del cliente es requerido")
        Long customerId,

        @NotEmpty(message = "Debe incluir al menos un item")
        @Size(min = 1, message = "Debe incluir al menos un item")
        @Valid
        List<OrderItemRequest> items,

        @NotNull(message = "La dirección de envío es requerida")
        @Valid
        AddressDTO shippingAddress,

        @Valid
        AddressDTO billingAddress
) {}
