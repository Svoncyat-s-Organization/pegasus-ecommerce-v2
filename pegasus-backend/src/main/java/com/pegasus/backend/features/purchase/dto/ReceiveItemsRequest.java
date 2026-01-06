package com.pegasus.backend.features.purchase.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ReceiveItemsRequest(
        @NotEmpty @Valid List<ReceiveItemRequest> items) {
}
