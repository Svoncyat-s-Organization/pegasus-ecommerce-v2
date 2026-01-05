package com.pegasus.backend.features.logistic.dto;

import java.time.OffsetDateTime;

public record TrackingEventResponse(
        Long id,
        Long shipmentId,
        String status,
        String location,
        String description,
        Boolean isPublic,
        OffsetDateTime eventDate,
        Long createdById,
        String createdByUsername,
        OffsetDateTime createdAt) {
}
