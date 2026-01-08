package com.pegasus.backend.features.catalog.dto;

import com.pegasus.backend.features.catalog.entity.CategorySpecification;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Response DTO for CategorySpecification
 */
public record CategorySpecificationResponse(
    Long id,
    Long categoryId,
    String name,
    String displayName,
    CategorySpecification.SpecType specType,
    String unit,
    List<String> options,
    Boolean isRequired,
    Integer position,
    Boolean isActive,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
