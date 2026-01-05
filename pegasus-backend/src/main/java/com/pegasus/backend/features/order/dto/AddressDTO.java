package com.pegasus.backend.features.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO para direcciones de envío y facturación
 * Se almacena como JSONB en la base de datos
 */
public record AddressDTO(
        @NotBlank(message = "El ubigeo es requerido")
        @Size(min = 6, max = 6, message = "El ubigeo debe tener 6 caracteres")
        String ubigeoId,

        @NotBlank(message = "La dirección es requerida")
        String address,

        String reference,

        @NotBlank(message = "El nombre del destinatario es requerido")
        String recipientName,

        @NotBlank(message = "El teléfono del destinatario es requerido")
        @Pattern(regexp = "^9\\d{8}$", message = "El teléfono debe tener 9 dígitos e iniciar con 9")
        String recipientPhone
) {}
