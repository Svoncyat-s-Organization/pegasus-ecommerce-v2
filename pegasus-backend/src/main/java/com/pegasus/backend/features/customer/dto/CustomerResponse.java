package com.pegasus.backend.features.customer.dto;

import com.pegasus.backend.shared.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para Customer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String username;
    private String email;
    private DocumentType docType;
    private String docNumber;
    private String firstName;
    private String lastName;
    private String phone;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
