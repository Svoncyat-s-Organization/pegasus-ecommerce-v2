package com.pegasus.backend.security.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para login (Admin y Customer)
 */
public record LoginRequest(
        @NotBlank(message = "Email es requerido")
        @Email(message = "Email debe ser válido")
        String email,

        @NotBlank(message = "Password es requerido")
        String password
) {}
