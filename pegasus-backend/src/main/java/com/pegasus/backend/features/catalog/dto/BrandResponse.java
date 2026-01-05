package com.pegasus.backend.features.catalog.dto;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para Brand
 */
public record BrandResponse(
        Long id,
        String name,
        String slug,
        String imageUrl,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
