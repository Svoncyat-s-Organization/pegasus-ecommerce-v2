package com.pegasus.backend.features.order.dto;

import com.pegasus.backend.shared.enums.ShipmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO para crear envío desde un pedido (backoffice manual creation)
 * La información del pedido (order_id, shipping_address) se obtiene
 * automáticamente
 */
@Data
public class CreateShipmentForOrderRequest {

    @NotNull(message = "El tipo de envío es requerido")
    private ShipmentType shipmentType;

    @NotNull(message = "El método de envío es requerido")
    private Long shippingMethodId;

    @NotBlank(message = "El número de tracking es requerido")
    private String trackingNumber;

    @NotNull(message = "El costo de envío es requerido")
    @Positive(message = "El costo de envío debe ser positivo")
    private BigDecimal shippingCost;

    @NotNull(message = "El peso es requerido")
    @Positive(message = "El peso debe ser positivo")
    private BigDecimal weightKg;

    @NotNull(message = "La fecha estimada de entrega es requerida")
    private OffsetDateTime estimatedDeliveryDate;

    private String recipientName; // Opcional, si no se provee se usa del pedido

    private String recipientPhone; // Opcional, si no se provee se usa del pedido

    private Boolean requireSignature = false;

    @Positive(message = "La cantidad de paquetes debe ser positiva")
    private Integer packageQuantity = 1;

    private String notes;
}
