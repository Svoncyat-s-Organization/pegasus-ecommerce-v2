package com.pegasus.backend.features.user.controller;

import com.pegasus.backend.features.user.dto.ChangePasswordRequest;
import com.pegasus.backend.features.user.dto.CreateUserRequest;
import com.pegasus.backend.features.user.dto.UpdateUserRequest;
import com.pegasus.backend.features.user.dto.UserResponse;
import com.pegasus.backend.features.user.service.UserService;
import com.pegasus.backend.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestión de usuarios backoffice
 * Endpoints protegidos con rol ADMIN
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestión de usuarios backoffice")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    /**
     * GET /api/admin/users - Listar todos los usuarios (paginado)
     */
    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Obtener todos los usuarios con paginación")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        PageResponse<UserResponse> response = userService.getAllUsers(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/users/{id} - Obtener usuario por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Retorna los datos de un usuario específico")
    @ApiResponse(responseCode = "200", description = "Usuario encontrado")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/users - Crear nuevo usuario
     */
    @PostMapping
    @Operation(summary = "Crear usuario", description = "Registrar un nuevo usuario backoffice")
    @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o email/username duplicado")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/admin/users/{id} - Actualizar usuario
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario", description = "Modificar datos de un usuario existente")
    @ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/admin/users/{id}/password - Cambiar contraseña
     */
    @PatchMapping("/{id}/password")
    @Operation(summary = "Cambiar contraseña", description = "Actualizar la contraseña de un usuario")
    @ApiResponse(responseCode = "204", description = "Contraseña actualizada exitosamente")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/admin/users/{id}/toggle-status - Activar/desactivar usuario
     */
    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Cambiar estado", description = "Activar o desactivar un usuario")
    @ApiResponse(responseCode = "204", description = "Estado cambiado exitosamente")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/admin/users/{id} - Eliminar usuario permanentemente
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario", description = "Eliminar permanentemente un usuario (usar con precaución)")
    @ApiResponse(responseCode = "204", description = "Usuario eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
