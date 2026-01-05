package com.pegasus.backend.features.inventory.dto;

import com.pegasus.backend.shared.enums.OperationType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO de respuesta para movimiento de inventario
 */
public record MovementResponse(
        Long id,
        Long variantId,
        String variantSku,
        String productName,
        Long warehouseId,
        String warehouseCode,
        String warehouseName,
        Integer quantity,
        Integer balance,
        BigDecimal unitCost,
        OperationType operationType,
        String description,
        Long referenceId,
        String referenceTable,
        Long userId,
        String username,
        OffsetDateTime createdAt
) {}
