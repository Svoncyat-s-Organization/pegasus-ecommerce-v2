package com.pegasus.backend.features.inventory.dto;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para almacén
 */
public record WarehouseResponse(
        Long id,
        String code,
        String name,
        String ubigeoId,
        String address,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
