package com.pegasus.backend.features.user.dto;

import com.pegasus.backend.shared.enums.DocumentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para crear un nuevo usuario backoffice
 */
public record CreateUserRequest(
        @NotBlank(message = "Username es requerido")
        @Size(min = 3, max = 50, message = "Username debe tener entre 3 y 50 caracteres")
        String username,

        @NotBlank(message = "Email es requerido")
        @Email(message = "Email debe ser válido")
        String email,

        @NotBlank(message = "Password es requerido")
        @Size(min = 6, message = "Password debe tener al menos 6 caracteres")
        String password,

        @NotNull(message = "Tipo de documento es requerido")
        DocumentType docType,

        @NotBlank(message = "Número de documento es requerido")
        @Size(max = 20, message = "Número de documento no puede exceder 20 caracteres")
        String docNumber,

        @NotBlank(message = "Nombre es requerido")
        @Size(max = 100, message = "Nombre no puede exceder 100 caracteres")
        String firstName,

        @NotBlank(message = "Apellido es requerido")
        @Size(max = 100, message = "Apellido no puede exceder 100 caracteres")
        String lastName,

        @Size(max = 20, message = "Teléfono no puede exceder 20 caracteres")
        String phone
) {}
