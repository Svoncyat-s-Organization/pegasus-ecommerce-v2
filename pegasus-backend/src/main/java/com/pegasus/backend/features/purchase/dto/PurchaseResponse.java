package com.pegasus.backend.features.purchase.dto;

import com.pegasus.backend.features.purchase.entity.PurchaseStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Builder
public record PurchaseResponse(
        Long id,
        SupplierResponse supplier,
        Long warehouseId,
        Long userId,
        PurchaseStatus status,
        String invoiceType,
        String invoiceNumber,
        BigDecimal totalAmount,
        LocalDate purchaseDate,
        String notes,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<PurchaseItemResponse> items) {
}
