package com.pegasus.backend.features.purchase.dto;

import com.pegasus.backend.features.purchase.entity.SupplierDocumentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateSupplierRequest(
        SupplierDocumentType docType,

        @Size(max = 20, message = "Número de documento no puede exceder 20 caracteres") String docNumber,

        @Size(max = 150, message = "Razón social no puede exceder 150 caracteres") String companyName,

        @Size(max = 100, message = "Nombre de contacto no puede exceder 100 caracteres") String contactName,

        @Size(max = 20, message = "Teléfono no puede exceder 20 caracteres") String phone,

        @Email(message = "Email debe ser válido") @Size(max = 255, message = "Email no puede exceder 255 caracteres") String email,

        String address,

        @Size(min = 6, max = 6, message = "Ubigeo debe tener 6 caracteres") String ubigeoId) {
}
