package com.pegasus.backend.features.rma.dto;

import com.pegasus.backend.shared.enums.RmaStatus;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para historial de estados de RMA
 */
public record RmaStatusHistoryResponse(
        Long id,
        Long rmaId,
        RmaStatus status,
        String comments,
        Long createdBy,
        String creatorName,
        OffsetDateTime createdAt
) {}
