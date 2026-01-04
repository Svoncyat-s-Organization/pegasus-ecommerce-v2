package com.pegasus.backend.features.rbac.dto;

import java.util.List;

/**
 * DTO de respuesta que incluye un rol con sus módulos asignados
 */
public record RoleWithModulesResponse(
        Long roleId,
        String roleName,
        String roleDescription,
        List<ModuleResponse> modules
) {}
