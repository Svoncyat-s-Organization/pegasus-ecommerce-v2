package com.pegasus.backend.shared.locations.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO para ubicación completa (ubigeo)
 * Incluye departamento, provincia, distrito y sus IDs para navegación
 */
@Schema(description = "Ubicación completa del sistema de ubigeo de Perú")
public record UbigeoResponse(
        @Schema(description = "ID único del ubigeo (distrito)", example = "150101") String id,

        @Schema(description = "Nombre del departamento", example = "Lima") String department,

        @Schema(description = "Nombre de la provincia", example = "Lima") String province,

        @Schema(description = "Nombre del distrito", example = "Lima") String district,

        @Schema(description = "ID del departamento (2 primeros dígitos)", example = "15") String departmentId,

        @Schema(description = "ID de la provincia (4 primeros dígitos)", example = "1501") String provinceId) {
}
