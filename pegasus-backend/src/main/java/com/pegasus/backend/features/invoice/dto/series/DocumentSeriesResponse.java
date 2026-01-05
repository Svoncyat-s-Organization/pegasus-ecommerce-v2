package com.pegasus.backend.features.invoice.dto.series;

import com.pegasus.backend.features.invoice.entity.series.DocumentSeriesType;

import java.time.OffsetDateTime;

public record DocumentSeriesResponse(
        Long id,
        DocumentSeriesType documentType,
        String series,
        Integer currentNumber,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
