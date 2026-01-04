package com.pegasus.backend.features.rbac.dto;

import lombok.Builder;

/**
 * DTO de respuesta para Role
 */
@Builder
public record RoleResponse(
        Long id,
        String name,
        String description
) {}
