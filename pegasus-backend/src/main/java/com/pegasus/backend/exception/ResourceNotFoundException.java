package com.pegasus.backend.exception;

/**
 * Excepción personalizada para recursos no encontrados
 * Se lanza cuando se busca una entidad por ID y no existe
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
