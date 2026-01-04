package com.pegasus.backend.features.user.dto;

import com.pegasus.backend.shared.enums.DocumentType;
import lombok.Builder;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para User (Backoffice)
 * Retorna datos públicos del usuario (sin password)
 */
@Builder
public record UserResponse(
        Long id,
        String username,
        String email,
        DocumentType docType,
        String docNumber,
        String firstName,
        String lastName,
        String phone,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
