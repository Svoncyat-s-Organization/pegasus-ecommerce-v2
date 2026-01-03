package com.pegasus.backend.security.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO para registro de clientes (Storefront)
 */
public record RegisterCustomerRequest(
        @NotBlank(message = "Email es requerido")
        @Email(message = "Email debe ser válido")
        String email,

        @NotBlank(message = "Username es requerido")
        @Size(min = 3, max = 50, message = "Username debe tener entre 3 y 50 caracteres")
        String username,

        @NotBlank(message = "Password es requerido")
        @Size(min = 6, message = "Password debe tener al menos 6 caracteres")
        String password,

        @NotBlank(message = "Nombre es requerido")
        @Size(max = 100)
        String firstName,

        @NotBlank(message = "Apellido es requerido")
        @Size(max = 100)
        String lastName,

        @NotBlank(message = "Tipo de documento es requerido")
        @Pattern(regexp = "DNI|CE", message = "Tipo de documento debe ser DNI o CE")
        String docType,

        @NotBlank(message = "Número de documento es requerido")
        @Size(max = 20)
        String docNumber,

        @Pattern(regexp = "^\\+?[0-9]{9,20}$", message = "Teléfono inválido")
        String phone
) {}
