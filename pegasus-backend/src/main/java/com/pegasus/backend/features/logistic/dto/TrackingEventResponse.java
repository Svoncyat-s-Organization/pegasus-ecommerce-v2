package com.pegasus.backend.features.logistic.dto;

import com.pegasus.backend.shared.enums.ShipmentStatus;

import java.time.OffsetDateTime;

public record TrackingEventResponse(
        Long id,
        Long shipmentId,
        ShipmentStatus status,
        String location,
        String description,
        Boolean isPublic,
        OffsetDateTime eventDate,
        Long createdById,
        String createdByUsername,
        OffsetDateTime createdAt) {
}
