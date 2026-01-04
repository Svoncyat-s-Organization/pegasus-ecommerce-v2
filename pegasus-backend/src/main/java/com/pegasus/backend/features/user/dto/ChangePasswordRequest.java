package com.pegasus.backend.features.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para cambiar contraseña de usuario
 */
public record ChangePasswordRequest(
        @NotBlank(message = "Nueva contraseña es requerida")
        @Size(min = 6, message = "Nueva contraseña debe tener al menos 6 caracteres")
        String newPassword
) {}
