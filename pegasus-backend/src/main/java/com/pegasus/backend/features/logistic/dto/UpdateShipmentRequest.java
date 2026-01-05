package com.pegasus.backend.features.logistic.dto;

import com.pegasus.backend.shared.enums.ShipmentStatus;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class UpdateShipmentRequest {

    private ShipmentStatus status;
    private String notes;
    private OffsetDateTime shippedAt;
    private OffsetDateTime deliveredAt;
}
