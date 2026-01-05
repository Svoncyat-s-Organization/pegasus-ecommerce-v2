package com.pegasus.backend.security.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para login (Admin y Customer)
 * Acepta username o email para el campo usernameOrEmail
 */
public record LoginRequest(
        @NotBlank(message = "Usuario o email es requerido")
        String usernameOrEmail,

        @NotBlank(message = "Password es requerido")
        String password
) {}
