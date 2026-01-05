package com.pegasus.backend.features.logistic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

@Data
public class CreateShipmentRequest {

    @NotBlank(message = "El tipo de envío es requerido")
    private String shipmentType;

    @NotNull(message = "El ID de orden es requerido")
    private Long orderId;

    private Long rmaId;

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

    @NotNull(message = "La dirección de envío es requerida")
    private Map<String, Object> shippingAddress;

    @NotBlank(message = "El nombre del destinatario es requerido")
    private String recipientName;

    @NotBlank(message = "El teléfono del destinatario es requerido")
    private String recipientPhone;

    private Boolean requireSignature = false;

    @Positive(message = "La cantidad de paquetes debe ser positiva")
    private Integer packageQuantity = 1;

    private String notes;
}
