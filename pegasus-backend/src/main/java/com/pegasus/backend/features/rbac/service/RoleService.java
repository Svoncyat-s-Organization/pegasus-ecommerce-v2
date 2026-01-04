package com.pegasus.backend.features.rbac.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.rbac.dto.CreateRoleRequest;
import com.pegasus.backend.features.rbac.dto.RoleResponse;
import com.pegasus.backend.features.rbac.dto.UpdateRoleRequest;
import com.pegasus.backend.features.rbac.entity.Role;
import com.pegasus.backend.features.rbac.mapper.RoleMapper;
import com.pegasus.backend.features.rbac.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de gestión de roles
 * Maneja CRUD de roles
 */
@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    /**
     * Obtener todos los roles
     */
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    /**
     * Obtener rol por ID
     */
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = findRoleById(id);
        return roleMapper.toResponse(role);
    }

    /**
     * Crear nuevo rol
     */
    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        if (roleRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Ya existe un rol con ese nombre");
        }

        Role role = roleMapper.toEntity(request);
        Role savedRole = roleRepository.save(role);
        return roleMapper.toResponse(savedRole);
    }

    /**
     * Actualizar rol existente
     */
    @Transactional
    public RoleResponse updateRole(Long id, UpdateRoleRequest request) {
        Role role = findRoleById(id);

        // Validar duplicado de nombre (excluyendo el rol actual)
        if (!role.getName().equals(request.name()) && roleRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Ya existe un rol con ese nombre");
        }

        roleMapper.updateEntity(request, role);
        Role updatedRole = roleRepository.save(role);
        return roleMapper.toResponse(updatedRole);
    }

    /**
     * Eliminar rol permanentemente
     */
    @Transactional
    public void deleteRole(Long id) {
        Role role = findRoleById(id);
        roleRepository.delete(role);
    }

    // Helper method
    private Role findRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + id));
    }
}
