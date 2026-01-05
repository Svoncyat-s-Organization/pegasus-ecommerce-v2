package com.pegasus.backend.exception;

/**
 * Excepción personalizada para solicitudes inválidas
 * Se lanza cuando los datos de entrada no cumplen con las reglas de negocio
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
