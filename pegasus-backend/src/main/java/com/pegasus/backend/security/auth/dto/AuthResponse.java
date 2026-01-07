package com.pegasus.backend.security.auth.dto;

import lombok.Builder;

/**
 * DTO de respuesta tras autenticación exitosa
 */
@Builder
public record AuthResponse(
                String token,
                String userType, // "ADMIN" o "CUSTOMER"
                Long userId,
                String email,
                String username,
                Long expiresIn // Milisegundos
) {
}
