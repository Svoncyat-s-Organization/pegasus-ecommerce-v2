package com.pegasus.backend.features.catalog.dto;

import java.time.OffsetDateTime;
import java.util.List;

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
        OffsetDateTime updatedAt,
        List<CategoryResponse> children // Para estructura jerárquica
) {
    // Constructor sin children para compatibilidad
    public CategoryResponse(Long id, String name, String slug, String description,
                          Long parentId, String parentName, Boolean isActive,
                          OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this(id, name, slug, description, parentId, parentName, isActive, createdAt, updatedAt, null);
    }
}
