package com.pegasus.backend.features.catalog.dto;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * DTO de respuesta para Product
 */
public record ProductResponse(
        Long id,
        String code,
        String name,
        String slug,
        String description,
        Long brandId,
        String brandName,
        Long categoryId,
        String categoryName,
        Map<String, Object> specs,
        Boolean isFeatured,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
