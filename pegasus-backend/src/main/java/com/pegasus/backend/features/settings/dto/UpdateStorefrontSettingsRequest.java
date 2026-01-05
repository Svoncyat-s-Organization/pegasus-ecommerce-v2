package com.pegasus.backend.features.settings.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request para actualizar configuración del storefront
 */
public record UpdateStorefrontSettingsRequest(
        @NotBlank(message = "El nombre de la tienda es requerido")
        @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
        String storefrontName,

        String logoUrl,

        String faviconUrl,

        @NotBlank(message = "El color primario es requerido")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color primario inválido (formato: #RRGGBB)")
        String primaryColor,

        @NotBlank(message = "El color secundario es requerido")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color secundario inválido (formato: #RRGGBB)")
        String secondaryColor,

        String termsAndConditions,

        String privacyPolicy,

        String returnPolicy,

        String shippingPolicy,

        @Email(message = "Formato de email de soporte inválido")
        String supportEmail,

        @Pattern(regexp = "^9\\d{8}$", message = "Teléfono de soporte inválido (9 dígitos iniciando con 9)")
        String supportPhone,

        @Pattern(regexp = "^9\\d{8}$", message = "Número de WhatsApp inválido (9 dígitos iniciando con 9)")
        String whatsappNumber
) {}
