package com.pegasus.backend.features.purchase.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReceiveItemRequest(
        @NotNull Long itemId,
        @NotNull @Min(1) Integer quantity) {
}
