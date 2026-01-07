package com.pegasus.backend.features.settings.dto;

import java.time.OffsetDateTime;

/**
 * Response con configuración del storefront
 */
public record StorefrontSettingsResponse(
        Long id,
        String storefrontName,
        String logoUrl,
        String faviconUrl,
        String heroImageUrl,
        String primaryColor,
        String secondaryColor,
        String termsAndConditions,
        String privacyPolicy,
        String returnPolicy,
        String shippingPolicy,
        String supportEmail,
        String supportPhone,
        String whatsappNumber,
        Boolean isActive,
        OffsetDateTime updatedAt
) {}
