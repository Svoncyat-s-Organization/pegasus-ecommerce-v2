package com.pegasus.backend.features.rma.dto;

import com.pegasus.backend.shared.enums.ItemCondition;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO de respuesta para items de RMA
 */
public record RmaItemResponse(
        Long id,
        Long rmaId,
        Long orderItemId,
        Long variantId,
        String variantSku,
        String productName,
        Integer quantity,
        ItemCondition itemCondition,
        String inspectionNotes,
        BigDecimal refundAmount,
        Boolean restockApproved,
        Long inspectedBy,
        String inspectorName,
        OffsetDateTime inspectedAt,
        OffsetDateTime createdAt
) {}
