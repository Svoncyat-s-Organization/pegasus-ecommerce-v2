package com.pegasus.backend.features.catalog.dto;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para Category
 */
public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        Long parentId,
        String parentName,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
