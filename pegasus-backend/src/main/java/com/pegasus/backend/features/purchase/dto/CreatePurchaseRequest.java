package com.pegasus.backend.features.purchase.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreatePurchaseRequest(
        @NotNull(message = "Supplier ID es requerido") Long supplierId,

        @NotNull(message = "Warehouse ID es requerido") Long warehouseId,

        @NotNull(message = "User ID es requerido") Long userId,

        @NotBlank(message = "Tipo de comprobante es requerido") @Size(max = 20, message = "Tipo de comprobante no puede exceder 20 caracteres") String invoiceType,

        @NotBlank(message = "Número de comprobante es requerido") @Size(max = 50, message = "Número de comprobante no puede exceder 50 caracteres") String invoiceNumber,

        LocalDate purchaseDate,

        String notes,

        @NotEmpty(message = "Items es requerido") List<@Valid CreatePurchaseItemRequest> items) {
}
