package com.pegasus.backend.features.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear un nuevo rol
 */
public record CreateRoleRequest(
        @NotBlank(message = "Nombre del rol es requerido")
        @Size(max = 50, message = "Nombre del rol no puede exceder 50 caracteres")
        String name,

        @Size(max = 255, message = "Descripción no puede exceder 255 caracteres")
        String description
) {}
