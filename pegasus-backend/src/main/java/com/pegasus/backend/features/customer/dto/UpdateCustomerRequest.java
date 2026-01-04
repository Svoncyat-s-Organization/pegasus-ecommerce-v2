package com.pegasus.backend.features.customer.dto;

import com.pegasus.backend.shared.enums.DocumentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar un Customer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCustomerRequest {
    
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;
    
    @Email(message = "Formato de correo inválido")
    private String email;
    
    private DocumentType docType;
    
    @Pattern(regexp = "^[0-9]{8}$|^[A-Za-z0-9]{9,12}$", 
             message = "DNI debe ser 8 dígitos o CE entre 9-12 caracteres alfanuméricos")
    private String docNumber;
    
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String firstName;
    
    @Size(max = 100, message = "El apellido no puede exceder 100 caracteres")
    private String lastName;
    
    @Pattern(regexp = "^[0-9]{9}$", message = "El teléfono debe ser 9 dígitos (sin +51)")
    private String phone;
}
