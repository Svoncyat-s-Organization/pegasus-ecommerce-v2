package com.pegasus.backend.features.invoice.dto;

import com.pegasus.backend.features.invoice.entity.InvoiceType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CreateInvoiceRequest(
        @NotNull(message = "El orderId es requerido") Long orderId,

        @NotNull(message = "El tipo de comprobante es requerido") InvoiceType invoiceType,

        @NotBlank(message = "La serie es requerida") @Size(max = 4, message = "La serie no puede exceder 4 caracteres") String series,

        @NotBlank(message = "El número es requerido") @Size(max = 8, message = "El número no puede exceder 8 caracteres") String number,

        @NotBlank(message = "El documento del receptor es requerido") @Size(max = 20, message = "El documento del receptor no puede exceder 20 caracteres") String receiverTaxId,

        @NotBlank(message = "El nombre del receptor es requerido") @Size(max = 150, message = "El nombre del receptor no puede exceder 150 caracteres") String receiverName,

        @NotNull(message = "El subtotal es requerido") @DecimalMin(value = "0.00", inclusive = true, message = "El subtotal debe ser mayor o igual a 0") BigDecimal subtotal,

        @NotNull(message = "El IGV es requerido") @DecimalMin(value = "0.00", inclusive = true, message = "El IGV debe ser mayor o igual a 0") BigDecimal taxAmount,

        @NotNull(message = "El total es requerido") @DecimalMin(value = "0.01", inclusive = true, message = "El total debe ser mayor a 0") BigDecimal totalAmount,

        OffsetDateTime issuedAt) {
}
