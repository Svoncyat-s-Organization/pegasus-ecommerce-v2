package com.pegasus.backend.features.rbac.controller;

import com.pegasus.backend.features.rbac.dto.CreateRoleRequest;
import com.pegasus.backend.features.rbac.dto.RoleResponse;
import com.pegasus.backend.features.rbac.dto.UpdateRoleRequest;
import com.pegasus.backend.features.rbac.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de roles
 * Endpoints protegidos con rol ADMIN
 */
@RestController
@RequestMapping("/api/admin/rbac/roles")
@RequiredArgsConstructor
@Tag(name = "RBAC - Roles", description = "Gestión de roles del sistema")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService roleService;

    /**
     * GET /api/admin/rbac/roles - Listar todos los roles
     */
    @GetMapping
    @Operation(summary = "Listar roles", description = "Obtener todos los roles del sistema")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * GET /api/admin/rbac/roles/{id} - Obtener rol por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener rol por ID", description = "Retorna los datos de un rol específico")
    @ApiResponse(responseCode = "200", description = "Rol encontrado")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long id) {
        RoleResponse role = roleService.getRoleById(id);
        return ResponseEntity.ok(role);
    }

    /**
     * POST /api/admin/rbac/roles - Crear nuevo rol
     */
    @PostMapping
    @Operation(summary = "Crear rol", description = "Registrar un nuevo rol en el sistema")
    @ApiResponse(responseCode = "201", description = "Rol creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o nombre duplicado")
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody CreateRoleRequest request) {
        RoleResponse role = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(role);
    }

    /**
     * PUT /api/admin/rbac/roles/{id} - Actualizar rol
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar rol", description = "Modificar datos de un rol existente")
    @ApiResponse(responseCode = "200", description = "Rol actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        RoleResponse role = roleService.updateRole(id, request);
        return ResponseEntity.ok(role);
    }

    /**
     * DELETE /api/admin/rbac/roles/{id} - Eliminar rol
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar rol", description = "Eliminar permanentemente un rol (usar con precaución)")
    @ApiResponse(responseCode = "204", description = "Rol eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Rol no encontrado")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
