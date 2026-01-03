package com.pegasus.backend.security.auth.controller;

import com.pegasus.backend.security.auth.dto.AuthResponse;
import com.pegasus.backend.security.auth.dto.LoginRequest;
import com.pegasus.backend.security.auth.dto.RegisterCustomerRequest;
import com.pegasus.backend.security.auth.service.CustomerAuthService;
import com.pegasus.backend.security.auth.service.UserAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación (Endpoints públicos)
 * Maneja login para Admin y Customer, y registro de Customer
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints públicos de autenticación")
public class AuthController {

    private final UserAuthService userAuthService;
    private final CustomerAuthService customerAuthService;

    /**
     * POST /api/auth/admin/login
     * Login para usuarios backoffice (Admin/Workers)
     */
    @PostMapping("/admin/login")
    @Operation(
            summary = "Login Backoffice",
            description = "Autenticación para usuarios administradores"
    )
    @ApiResponse(responseCode = "200", description = "Login exitoso")
    @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/customer/login
     * Login para clientes storefront
     */
    @PostMapping("/customer/login")
    @Operation(
            summary = "Login Cliente",
            description = "Autenticación para clientes del storefront"
    )
    @ApiResponse(responseCode = "200", description = "Login exitoso")
    @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    public ResponseEntity<AuthResponse> customerLogin(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = customerAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/customer/register
     * Registro de nuevos clientes
     */
    @PostMapping("/customer/register")
    @Operation(
            summary = "Registro de Cliente",
            description = "Crear cuenta nueva para cliente storefront"
    )
    @ApiResponse(responseCode = "200", description = "Registro exitoso")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o email duplicado")
    public ResponseEntity<AuthResponse> customerRegister(@Valid @RequestBody RegisterCustomerRequest request) {
        AuthResponse response = customerAuthService.register(request);
        return ResponseEntity.ok(response);
    }
}
