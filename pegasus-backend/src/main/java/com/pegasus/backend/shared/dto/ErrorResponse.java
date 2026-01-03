package com.pegasus.backend.shared.dto;

import java.time.OffsetDateTime;

/**
 * DTO estándar para respuestas de error
 * Usado por GlobalExceptionHandler
 */
public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,
        OffsetDateTime timestamp
) {}
