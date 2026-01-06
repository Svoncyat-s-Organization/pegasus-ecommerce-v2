package com.pegasus.backend.features.user.controller;

import com.pegasus.backend.features.user.dto.ChangePasswordRequest;
import com.pegasus.backend.features.user.dto.UpdateUserRequest;
import com.pegasus.backend.features.user.dto.UserResponse;
import com.pegasus.backend.features.user.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestión de perfil de usuario autenticado
 * Endpoints protegidos con rol ADMIN
 */
@RestController
@RequestMapping("/api/admin/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Gestión de perfil del usuario autenticado")
@PreAuthorize("hasRole('ADMIN')")
public class ProfileController {

    private final ProfileService profileService;

    /**
     * GET /api/admin/profile - Obtener perfil del usuario autenticado
     */
    @GetMapping
    @Operation(summary = "Obtener mi perfil", description = "Retorna los datos del usuario autenticado")
    @ApiResponse(responseCode = "200", description = "Perfil obtenido exitosamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        UserResponse response = profileService.getProfile(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/profile - Actualizar perfil del usuario autenticado
     */
    @PutMapping
    @Operation(summary = "Actualizar mi perfil", description = "Modificar datos del usuario autenticado")
    @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    public ResponseEntity<UserResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        UserResponse response = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/admin/profile/password - Cambiar contraseña del usuario
     * autenticado
     */
    @PatchMapping("/password")
    @Operation(summary = "Cambiar mi contraseña", description = "Actualizar la contraseña del usuario autenticado")
    @ApiResponse(responseCode = "204", description = "Contraseña actualizada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    public ResponseEntity<Void> changeMyPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        profileService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }
}
