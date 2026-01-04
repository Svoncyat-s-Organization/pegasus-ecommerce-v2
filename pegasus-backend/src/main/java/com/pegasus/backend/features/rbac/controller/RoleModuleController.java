package com.pegasus.backend.features.rbac.controller;

import com.pegasus.backend.features.rbac.dto.AssignModulesToRoleRequest;
import com.pegasus.backend.features.rbac.dto.RoleWithModulesResponse;
import com.pegasus.backend.features.rbac.service.RoleModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestión de permisos (Role-Module)
 * Endpoints protegidos con rol ADMIN
 */
@RestController
@RequestMapping("/api/admin/rbac/permissions")
@RequiredArgsConstructor
@Tag(name = "RBAC - Permissions", description = "Asignación de módulos a roles (permisos)")
@PreAuthorize("hasRole('ADMIN')")
public class RoleModuleController {

    private final RoleModuleService roleModuleService;

    /**
     * GET /api/admin/rbac/permissions/roles/{roleId}/modules - Obtener módulos de un rol
     */
    @GetMapping("/roles/{roleId}/modules")
    @Operation(
            summary = "Obtener módulos de un rol",
            description = "Retorna todos los módulos a los que un rol tiene acceso"
    )
    @ApiResponse(responseCode = "200", description = "Módulos obtenidos exitosamente")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    public ResponseEntity<RoleWithModulesResponse> getModulesByRole(@PathVariable Long roleId) {
        RoleWithModulesResponse response = roleModuleService.getModulesByRole(roleId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/rbac/permissions/assign - Asignar módulos a un rol
     */
    @PostMapping("/assign")
    @Operation(
            summary = "Asignar módulos a rol",
            description = "Asigna múltiples módulos a un rol (reemplaza asignaciones previas)"
    )
    @ApiResponse(responseCode = "204", description = "Módulos asignados exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "404", description = "Rol o módulo no encontrado")
    public ResponseEntity<Void> assignModulesToRole(@Valid @RequestBody AssignModulesToRoleRequest request) {
        roleModuleService.assignModulesToRole(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/admin/rbac/permissions/roles/{roleId}/modules/{moduleId} - Revocar módulo de un rol
     */
    @DeleteMapping("/roles/{roleId}/modules/{moduleId}")
    @Operation(
            summary = "Revocar módulo de rol",
            description = "Elimina el acceso de un rol a un módulo específico"
    )
    @ApiResponse(responseCode = "204", description = "Módulo revocado exitosamente")
    @ApiResponse(responseCode = "404", description = "Asignación no encontrada")
    public ResponseEntity<Void> revokeModuleFromRole(
            @PathVariable Long roleId,
            @PathVariable Long moduleId
    ) {
        roleModuleService.revokeModuleFromRole(roleId, moduleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/admin/rbac/permissions/roles/{roleId}/modules - Revocar todos los módulos de un rol
     */
    @DeleteMapping("/roles/{roleId}/modules")
    @Operation(
            summary = "Revocar todos los módulos de un rol",
            description = "Elimina todos los permisos de módulos de un rol"
    )
    @ApiResponse(responseCode = "204", description = "Módulos revocados exitosamente")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    public ResponseEntity<Void> revokeAllModulesFromRole(@PathVariable Long roleId) {
        roleModuleService.revokeAllModulesFromRole(roleId);
        return ResponseEntity.noContent().build();
    }
}
