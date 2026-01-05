package com.pegasus.backend.features.logistic.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class UpdateShipmentRequest {

    private String status;
    private String notes;
    private OffsetDateTime shippedAt;
    private OffsetDateTime deliveredAt;
}
