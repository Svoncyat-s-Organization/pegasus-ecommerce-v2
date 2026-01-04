package com.pegasus.backend.features.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear una nueva dirección de cliente
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomerAddressRequest {
    
    @NotBlank(message = "El ubigeo es requerido")
    @Pattern(regexp = "^[0-9]{6}$", message = "El ubigeo debe ser 6 dígitos")
    private String ubigeoId;
    
    @NotBlank(message = "La dirección es requerida")
    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    private String address;
    
    private String reference;
    
    @Size(max = 20, message = "El código postal no puede exceder 20 caracteres")
    private String postalCode;
    
    private Boolean isDefaultShipping;
    
    private Boolean isDefaultBilling;
}
