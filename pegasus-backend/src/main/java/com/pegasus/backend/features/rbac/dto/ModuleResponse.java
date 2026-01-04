package com.pegasus.backend.features.rbac.dto;

import lombok.Builder;

/**
 * DTO de respuesta para Module
 */
@Builder
public record ModuleResponse(
        Long id,
        String icon,
        String name,
        String path
) {}
