package com.pegasus.backend.features.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para CustomerAddress
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddressResponse {
    private Long id;
    private Long customerId;
    private String ubigeoId;
    private String address;
    private String reference;
    private String postalCode;
    private Boolean isDefaultShipping;
    private Boolean isDefaultBilling;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
