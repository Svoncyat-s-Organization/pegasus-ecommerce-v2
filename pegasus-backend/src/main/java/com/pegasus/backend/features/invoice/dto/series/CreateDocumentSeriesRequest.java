package com.pegasus.backend.features.invoice.dto.series;

import com.pegasus.backend.features.invoice.entity.series.DocumentSeriesType;
import jakarta.validation.constraints.*;

public record CreateDocumentSeriesRequest(
        @NotNull(message = "El tipo de documento es requerido") DocumentSeriesType documentType,

        @NotBlank(message = "La serie es requerida") @Size(max = 4, message = "La serie no puede exceder 4 caracteres") String series,

        @Min(value = 0, message = "El correlativo debe ser mayor o igual a 0") Integer currentNumber) {
}
