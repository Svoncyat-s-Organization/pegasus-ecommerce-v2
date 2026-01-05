package com.pegasus.backend.features.purchase.dto;

import com.pegasus.backend.features.purchase.entity.SupplierDocumentType;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record SupplierResponse(
        Long id,
        SupplierDocumentType docType,
        String docNumber,
        String companyName,
        String contactName,
        String phone,
        String email,
        String address,
        String ubigeoId,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
