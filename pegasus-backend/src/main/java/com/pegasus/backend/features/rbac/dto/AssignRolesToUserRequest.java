package com.pegasus.backend.features.rbac.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTO para asignar roles a un usuario
 */
public record AssignRolesToUserRequest(
        @NotNull(message = "ID del usuario es requerido")
        Long userId,

        @NotEmpty(message = "Debe asignar al menos un rol")
        List<Long> roleIds
) {}
