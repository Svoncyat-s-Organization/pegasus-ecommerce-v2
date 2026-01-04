package com.pegasus.backend.features.rbac.dto;

import java.util.List;

/**
 * DTO de respuesta que incluye un usuario con sus roles asignados
 */
public record UserWithRolesResponse(
        Long userId,
        String username,
        String email,
        List<RoleResponse> roles
) {}
