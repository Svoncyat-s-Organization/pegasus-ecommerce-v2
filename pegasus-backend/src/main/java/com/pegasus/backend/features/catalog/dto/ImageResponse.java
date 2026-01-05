package com.pegasus.backend.features.catalog.dto;

/**
 * DTO de respuesta para Image
 */
public record ImageResponse(
        Long id,
        String imageUrl,
        Long productId,
        Long variantId,
        Boolean isPrimary,
        Integer displayOrder
) {}
