package com.pegasus.backend.features.rbac.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.rbac.dto.AssignModulesToRoleRequest;
import com.pegasus.backend.features.rbac.dto.ModuleResponse;
import com.pegasus.backend.features.rbac.dto.RoleWithModulesResponse;
import com.pegasus.backend.features.rbac.entity.Module;
import com.pegasus.backend.features.rbac.entity.Role;
import com.pegasus.backend.features.rbac.entity.RoleModule;
import com.pegasus.backend.features.rbac.mapper.ModuleMapper;
import com.pegasus.backend.features.rbac.repository.ModuleRepository;
import com.pegasus.backend.features.rbac.repository.RoleModuleRepository;
import com.pegasus.backend.features.rbac.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestionar la relación Role-Module
 * Asigna/revoca permisos de módulos a roles
 */
@Service
@RequiredArgsConstructor
public class RoleModuleService {

    private final RoleModuleRepository roleModuleRepository;
    private final RoleRepository roleRepository;
    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;

    /**
     * Obtener todos los módulos asignados a un rol
     */
    @Transactional(readOnly = true)
    public RoleWithModulesResponse getModulesByRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + roleId));

        List<Long> moduleIds = roleModuleRepository.findModuleIdsByRoleId(roleId);
        List<Module> modules = moduleRepository.findAllById(moduleIds);

        List<ModuleResponse> moduleResponses = modules.stream()
                .map(moduleMapper::toResponse)
                .toList();

        return new RoleWithModulesResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                moduleResponses
        );
    }

    /**
     * Asignar múltiples módulos a un rol (reemplaza asignaciones previas)
     */
    @Transactional
    public void assignModulesToRole(AssignModulesToRoleRequest request) {
        // Verificar que el rol existe
        if (!roleRepository.existsById(request.roleId())) {
            throw new ResourceNotFoundException("Rol no encontrado con ID: " + request.roleId());
        }

        // Verificar que todos los módulos existen
        List<Module> modules = moduleRepository.findAllById(request.moduleIds());
        if (modules.size() != request.moduleIds().size()) {
            throw new IllegalArgumentException("Uno o más IDs de módulos son inválidos");
        }

        // Eliminar asignaciones previas del rol
        roleModuleRepository.deleteByRoleId(request.roleId());

        // Crear nuevas asignaciones
        List<RoleModule> roleModules = request.moduleIds().stream()
                .map(moduleId -> RoleModule.builder()
                        .roleId(request.roleId())
                        .moduleId(moduleId)
                        .build())
                .toList();

        roleModuleRepository.saveAll(roleModules);
    }

    /**
     * Revocar un módulo específico de un rol
     */
    @Transactional
    public void revokeModuleFromRole(Long roleId, Long moduleId) {
        if (!roleModuleRepository.existsByRoleIdAndModuleId(roleId, moduleId)) {
            throw new ResourceNotFoundException("El rol no tiene asignado ese módulo");
        }

        roleModuleRepository.deleteByRoleIdAndModuleId(roleId, moduleId);
    }

    /**
     * Revocar todos los módulos de un rol
     */
    @Transactional
    public void revokeAllModulesFromRole(Long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new ResourceNotFoundException("Rol no encontrado con ID: " + roleId);
        }

        roleModuleRepository.deleteByRoleId(roleId);
    }
}
