package com.pegasus.backend.features.rbac.controller;

import com.pegasus.backend.features.rbac.dto.AssignRolesToUserRequest;
import com.pegasus.backend.features.rbac.dto.UserWithRolesResponse;
import com.pegasus.backend.features.rbac.service.RoleUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de asignaciones (Role-User)
 * Endpoints protegidos con rol ADMIN
 */
@RestController
@RequestMapping("/api/admin/rbac/assignments")
@RequiredArgsConstructor
@Tag(name = "RBAC - Assignments", description = "Asignación de roles a usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class RoleUserController {

    private final RoleUserService roleUserService;

    /**
     * GET /api/admin/rbac/assignments/users/{userId}/roles - Obtener roles de un usuario
     */
    @GetMapping("/users/{userId}/roles")
    @Operation(
            summary = "Obtener roles de un usuario",
            description = "Retorna todos los roles asignados a un usuario"
    )
    @ApiResponse(responseCode = "200", description = "Roles obtenidos exitosamente")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<UserWithRolesResponse> getRolesByUser(@PathVariable Long userId) {
        UserWithRolesResponse response = roleUserService.getRolesByUser(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/rbac/assignments/roles/{roleId}/users - Obtener usuarios de un rol
     */
    @GetMapping("/roles/{roleId}/users")
    @Operation(
            summary = "Obtener usuarios de un rol",
            description = "Retorna todos los usuarios que tienen asignado un rol específico"
    )
    @ApiResponse(responseCode = "200", description = "Usuarios obtenidos exitosamente")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    public ResponseEntity<List<Long>> getUsersByRole(@PathVariable Long roleId) {
        List<Long> userIds = roleUserService.getUsersByRole(roleId);
        return ResponseEntity.ok(userIds);
    }

    /**
     * POST /api/admin/rbac/assignments/assign - Asignar roles a un usuario
     */
    @PostMapping("/assign")
    @Operation(
            summary = "Asignar roles a usuario",
            description = "Asigna múltiples roles a un usuario (reemplaza asignaciones previas)"
    )
    @ApiResponse(responseCode = "204", description = "Roles asignados exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Usuario o rol no encontrado")
    public ResponseEntity<Void> assignRolesToUser(@Valid @RequestBody AssignRolesToUserRequest request) {
        roleUserService.assignRolesToUser(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/admin/rbac/assignments/users/{userId}/roles/{roleId} - Revocar rol de un usuario
     */
    @DeleteMapping("/users/{userId}/roles/{roleId}")
    @Operation(
            summary = "Revocar rol de usuario",
            description = "Elimina un rol específico de un usuario"
    )
    @ApiResponse(responseCode = "204", description = "Rol revocado exitosamente")
    @ApiResponse(responseCode = "404", description = "Asignación no encontrada")
    public ResponseEntity<Void> revokeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable Long roleId
    ) {
        roleUserService.revokeRoleFromUser(userId, roleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/admin/rbac/assignments/users/{userId}/roles - Revocar todos los roles de un usuario
     */
    @DeleteMapping("/users/{userId}/roles")
    @Operation(
            summary = "Revocar todos los roles de un usuario",
            description = "Elimina todos los roles asignados a un usuario"
    )
    @ApiResponse(responseCode = "204", description = "Roles revocados exitosamente")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    public ResponseEntity<Void> revokeAllRolesFromUser(@PathVariable Long userId) {
        roleUserService.revokeAllRolesFromUser(userId);
        return ResponseEntity.noContent().build();
    }
}
