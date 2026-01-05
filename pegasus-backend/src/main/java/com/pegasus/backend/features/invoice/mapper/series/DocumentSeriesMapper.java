package com.pegasus.backend.features.invoice.mapper.series;

import com.pegasus.backend.features.invoice.dto.series.DocumentSeriesResponse;
import com.pegasus.backend.features.invoice.entity.series.DocumentSeries;
import org.springframework.stereotype.Component;

@Component
public class DocumentSeriesMapper {

    public DocumentSeriesResponse toResponse(DocumentSeries entity) {
        if (entity == null) {
            return null;
        }
        return new DocumentSeriesResponse(
                entity.getId(),
                entity.getDocumentType(),
                entity.getSeries(),
                entity.getCurrentNumber(),
                entity.getIsActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
