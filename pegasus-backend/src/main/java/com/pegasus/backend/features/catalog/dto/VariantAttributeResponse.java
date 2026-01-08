package com.pegasus.backend.features.catalog.dto;

import com.pegasus.backend.features.catalog.entity.VariantAttribute;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Response DTO for VariantAttribute
 */
public record VariantAttributeResponse(
    Long id,
    String name,
    String displayName,
    VariantAttribute.AttributeType attributeType,
    List<String> options,
    String description,
    Boolean isActive,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
