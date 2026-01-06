package com.pegasus.backend.features.settings.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request para actualizar información de la empresa
 */
public record UpdateBusinessInfoRequest(
        @NotBlank(message = "El nombre de la empresa es requerido")
        @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
        String businessName,

        @NotBlank(message = "El RUC es requerido")
        @Pattern(regexp = "^(10|20)\\d{9}$", message = "RUC inválido (debe iniciar con 10 o 20 y tener 11 dígitos)")
        String ruc,

        @NotBlank(message = "La dirección legal es requerida")
        String legalAddress,

        @NotBlank(message = "El ubigeo es requerido")
        @Size(min = 6, max = 6, message = "El ubigeo debe tener 6 caracteres")
        String ubigeoId,

        @NotBlank(message = "El teléfono es requerido")
        @Pattern(regexp = "^9\\d{8}$", message = "Teléfono inválido (9 dígitos iniciando con 9)")
        String phone,

        @NotBlank(message = "El email es requerido")
        @Email(message = "Formato de email inválido")
        String email,

        @Size(max = 255, message = "La URL del sitio web no puede exceder 255 caracteres")
        String website,

        String logoUrl,

        String businessDescription,

        @Size(max = 255, message = "La URL de Facebook no puede exceder 255 caracteres")
        String facebookUrl,

        @Size(max = 255, message = "La URL de Instagram no puede exceder 255 caracteres")
        String instagramUrl,

        @Size(max = 255, message = "La URL de Twitter no puede exceder 255 caracteres")
        String twitterUrl,

        @Size(max = 255, message = "La URL de TikTok no puede exceder 255 caracteres")
        String tiktokUrl
) {}
