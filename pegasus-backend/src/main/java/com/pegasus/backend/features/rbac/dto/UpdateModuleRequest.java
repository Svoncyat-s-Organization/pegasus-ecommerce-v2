package com.pegasus.backend.features.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para actualizar un módulo
 */
public record UpdateModuleRequest(
        @Size(max = 50, message = "Icono no puede exceder 50 caracteres")
        String icon,

        @NotBlank(message = "Nombre del módulo es requerido")
        @Size(max = 50, message = "Nombre del módulo no puede exceder 50 caracteres")
        String name,

        @NotBlank(message = "Path es requerido")
        @Size(max = 100, message = "Path no puede exceder 100 caracteres")
        String path
) {}
