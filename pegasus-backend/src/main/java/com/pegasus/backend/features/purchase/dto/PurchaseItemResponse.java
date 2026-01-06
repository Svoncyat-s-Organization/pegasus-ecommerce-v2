package com.pegasus.backend.features.purchase.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Builder
public record PurchaseItemResponse(
                Long id,
                Long variantId,
                Integer quantity,
                BigDecimal unitCost,
                BigDecimal subtotal,
                OffsetDateTime createdAt,
                String variantSku,
                String productName,
                Integer receivedQuantity) {
}
