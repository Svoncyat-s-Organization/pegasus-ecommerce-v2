package com.pegasus.backend.features.logistic.dto;

import com.pegasus.backend.shared.enums.ShipmentStatus;
import com.pegasus.backend.shared.enums.ShipmentType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

public record ShipmentResponse(
        Long id,
        ShipmentType shipmentType,
        Long orderId,
        Long rmaId,
        Long shippingMethodId,
        String shippingMethodName,
        String trackingNumber,
        BigDecimal shippingCost,
        BigDecimal weightKg,
        ShipmentStatus status,
        OffsetDateTime estimatedDeliveryDate,
        Map<String, Object> shippingAddress,
        String recipientName,
        String recipientPhone,
        Boolean requireSignature,
        Integer packageQuantity,
        String notes,
        OffsetDateTime shippedAt,
        OffsetDateTime deliveredAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
