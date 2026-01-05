package com.pegasus.backend.features.logistic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class CreateTrackingEventRequest {

    @NotNull(message = "El ID de envío es requerido")
    private Long shipmentId;

    @NotBlank(message = "El estado es requerido")
    private String status;

    private String location;

    @NotBlank(message = "La descripción es requerida")
    private String description;

    private Boolean isPublic = true;

    private OffsetDateTime eventDate;
}
