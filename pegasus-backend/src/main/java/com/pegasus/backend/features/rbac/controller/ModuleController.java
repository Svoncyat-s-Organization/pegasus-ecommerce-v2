package com.pegasus.backend.features.rbac.controller;

import com.pegasus.backend.features.rbac.dto.CreateModuleRequest;
import com.pegasus.backend.features.rbac.dto.ModuleResponse;
import com.pegasus.backend.features.rbac.dto.UpdateModuleRequest;
import com.pegasus.backend.features.rbac.service.ModuleService;
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
 * Controlador REST para gestión de módulos
 * Endpoints protegidos con rol ADMIN
 */
@RestController
@RequestMapping("/api/admin/rbac/modules")
@RequiredArgsConstructor
@Tag(name = "RBAC - Modules", description = "Gestión de módulos del sistema")
@PreAuthorize("hasRole('ADMIN')")
public class ModuleController {

    private final ModuleService moduleService;

    /**
     * GET /api/admin/rbac/modules - Listar todos los módulos
     */
    @GetMapping
    @Operation(summary = "Listar módulos", description = "Obtener todos los módulos del sistema")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<ModuleResponse>> getAllModules() {
        List<ModuleResponse> modules = moduleService.getAllModules();
        return ResponseEntity.ok(modules);
    }

    /**
     * GET /api/admin/rbac/modules/{id} - Obtener módulo por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener módulo por ID", description = "Retorna los datos de un módulo específico")
    @ApiResponse(responseCode = "200", description = "Módulo encontrado")
    @ApiResponse(responseCode = "404", description = "Módulo no encontrado")
    public ResponseEntity<ModuleResponse> getModuleById(@PathVariable Long id) {
        ModuleResponse module = moduleService.getModuleById(id);
        return ResponseEntity.ok(module);
    }

    /**
     * POST /api/admin/rbac/modules - Crear nuevo módulo
     */
    @PostMapping
    @Operation(summary = "Crear módulo", description = "Registrar un nuevo módulo en el sistema")
    @ApiResponse(responseCode = "201", description = "Módulo creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o path duplicado")
    public ResponseEntity<ModuleResponse> createModule(@Valid @RequestBody CreateModuleRequest request) {
        ModuleResponse module = moduleService.createModule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(module);
    }

    /**
     * PUT /api/admin/rbac/modules/{id} - Actualizar módulo
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar módulo", description = "Modificar datos de un módulo existente")
    @ApiResponse(responseCode = "200", description = "Módulo actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Módulo no encontrado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<ModuleResponse> updateModule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateModuleRequest request
    ) {
        ModuleResponse module = moduleService.updateModule(id, request);
        return ResponseEntity.ok(module);
    }

    /**
     * DELETE /api/admin/rbac/modules/{id} - Eliminar módulo
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar módulo", description = "Eliminar permanentemente un módulo (usar con precaución)")
    @ApiResponse(responseCode = "204", description = "Módulo eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Módulo no encontrado")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }
}
