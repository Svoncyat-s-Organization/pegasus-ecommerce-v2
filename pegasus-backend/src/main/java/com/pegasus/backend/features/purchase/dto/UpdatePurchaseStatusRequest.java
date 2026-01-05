package com.pegasus.backend.features.purchase.dto;

import com.pegasus.backend.features.purchase.entity.PurchaseStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePurchaseStatusRequest(
        @NotNull(message = "Estado es requerido") PurchaseStatus status) {
}
