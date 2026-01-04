package com.pegasus.backend.features.rbac.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTO para asignar módulos a un rol
 */
public record AssignModulesToRoleRequest(
        @NotNull(message = "ID del rol es requerido")
        Long roleId,

        @NotEmpty(message = "Debe asignar al menos un módulo")
        List<Long> moduleIds
) {}
