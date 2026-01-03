package com.pegasus.backend.shared.dto;

import java.util.List;

/**
 * DTO genérico para respuestas paginadas
 * Usado en endpoints que retornan listas con paginación
 *
 * @param <T> Tipo de dato contenido en la página
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {}
