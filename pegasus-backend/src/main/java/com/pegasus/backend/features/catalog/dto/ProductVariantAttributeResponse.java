package com.pegasus.backend.features.catalog.dto;

import com.pegasus.backend.features.catalog.entity.VariantAttribute;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Response DTO for ProductVariantAttribute
 * Includes the full variant attribute details for frontend convenience
 */
public record ProductVariantAttributeResponse(
    Long id,
    Long productId,
    Long variantAttributeId,
    // Denormalized attribute details
    String attributeName,
    String attributeDisplayName,
    VariantAttribute.AttributeType attributeType,
    // Effective options (custom if set, otherwise global)
    List<String> effectiveOptions,
    // Original values
    List<String> customOptions,
    List<String> globalOptions,
    Integer position,
    Boolean isActive,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
