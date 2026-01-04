package com.pegasus.backend.features.rbac.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.rbac.dto.CreateModuleRequest;
import com.pegasus.backend.features.rbac.dto.ModuleResponse;
import com.pegasus.backend.features.rbac.dto.UpdateModuleRequest;
import com.pegasus.backend.features.rbac.entity.Module;
import com.pegasus.backend.features.rbac.mapper.ModuleMapper;
import com.pegasus.backend.features.rbac.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de gestión de módulos
 * Maneja CRUD de módulos del sistema
 */
@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;

    /**
     * Obtener todos los módulos
     */
    @Transactional(readOnly = true)
    public List<ModuleResponse> getAllModules() {
        return moduleRepository.findAll().stream()
                .map(moduleMapper::toResponse)
                .toList();
    }

    /**
     * Obtener módulo por ID
     */
    @Transactional(readOnly = true)
    public ModuleResponse getModuleById(Long id) {
        Module module = findModuleById(id);
        return moduleMapper.toResponse(module);
    }

    /**
     * Crear nuevo módulo
     */
    @Transactional
    public ModuleResponse createModule(CreateModuleRequest request) {
        if (moduleRepository.existsByPath(request.path())) {
            throw new IllegalArgumentException("Ya existe un módulo con ese path");
        }

        Module module = moduleMapper.toEntity(request);
        Module savedModule = moduleRepository.save(module);
        return moduleMapper.toResponse(savedModule);
    }

    /**
     * Actualizar módulo existente
     */
    @Transactional
    public ModuleResponse updateModule(Long id, UpdateModuleRequest request) {
        Module module = findModuleById(id);

        // Validar duplicado de path (excluyendo el módulo actual)
        if (!module.getPath().equals(request.path()) && moduleRepository.existsByPath(request.path())) {
            throw new IllegalArgumentException("Ya existe un módulo con ese path");
        }

        moduleMapper.updateEntity(request, module);
        Module updatedModule = moduleRepository.save(module);
        return moduleMapper.toResponse(updatedModule);
    }

    /**
     * Eliminar módulo permanentemente
     */
    @Transactional
    public void deleteModule(Long id) {
        Module module = findModuleById(id);
        moduleRepository.delete(module);
    }

    // Helper method
    private Module findModuleById(Long id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Módulo no encontrado con ID: " + id));
    }
}
