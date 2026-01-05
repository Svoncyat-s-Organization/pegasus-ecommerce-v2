package com.pegasus.backend.features.settings.dto;

import java.time.OffsetDateTime;

/**
 * Response con información de la empresa
 */
public record BusinessInfoResponse(
        Long id,
        String businessName,
        String ruc,
        String legalAddress,
        String ubigeoId,
        String phone,
        String email,
        String website,
        String logoUrl,
        String businessDescription,
        String facebookUrl,
        String instagramUrl,
        String twitterUrl,
        String tiktokUrl,
        Boolean isActive,
        OffsetDateTime updatedAt
) {}
