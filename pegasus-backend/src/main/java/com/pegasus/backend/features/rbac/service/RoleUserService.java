package com.pegasus.backend.features.rbac.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.rbac.dto.AssignRolesToUserRequest;
import com.pegasus.backend.features.rbac.dto.RoleResponse;
import com.pegasus.backend.features.rbac.dto.UserWithRolesResponse;
import com.pegasus.backend.features.rbac.entity.Role;
import com.pegasus.backend.features.rbac.entity.RoleUser;
import com.pegasus.backend.features.rbac.mapper.RoleMapper;
import com.pegasus.backend.features.rbac.repository.RoleRepository;
import com.pegasus.backend.features.rbac.repository.RoleUserRepository;
import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestionar la relación Role-User
 * Asigna/revoca roles a usuarios
 */
@Service
@RequiredArgsConstructor
public class RoleUserService {

    private final RoleUserRepository roleUserRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    /**
     * Obtener todos los roles asignados a un usuario
     */
    @Transactional(readOnly = true)
    public UserWithRolesResponse getRolesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        List<Long> roleIds = roleUserRepository.findRoleIdsByUserId(userId);
        List<Role> roles = roleRepository.findAllById(roleIds);

        List<RoleResponse> roleResponses = roles.stream()
                .map(roleMapper::toResponse)
                .toList();

        return new UserWithRolesResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roleResponses
        );
    }

    /**
     * Asignar múltiples roles a un usuario (reemplaza asignaciones previas)
     */
    @Transactional
    public void assignRolesToUser(AssignRolesToUserRequest request) {
        // Verificar que el usuario existe
        if (!userRepository.existsById(request.userId())) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + request.userId());
        }

        // Verificar que todos los roles existen
        List<Role> roles = roleRepository.findAllById(request.roleIds());
        if (roles.size() != request.roleIds().size()) {
            throw new IllegalArgumentException("Uno o más IDs de roles son inválidos");
        }

        // Eliminar asignaciones previas del usuario
        roleUserRepository.deleteByUserId(request.userId());

        // Crear nuevas asignaciones
        List<RoleUser> roleUsers = request.roleIds().stream()
                .map(roleId -> RoleUser.builder()
                        .roleId(roleId)
                        .userId(request.userId())
                        .build())
                .toList();

        roleUserRepository.saveAll(roleUsers);
    }

    /**
     * Revocar un rol específico de un usuario
     */
    @Transactional
    public void revokeRoleFromUser(Long userId, Long roleId) {
        if (!roleUserRepository.existsByRoleIdAndUserId(roleId, userId)) {
            throw new ResourceNotFoundException("El usuario no tiene asignado ese rol");
        }

        roleUserRepository.deleteByRoleIdAndUserId(roleId, userId);
    }

    /**
     * Revocar todos los roles de un usuario
     */
    @Transactional
    public void revokeAllRolesFromUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + userId);
        }

        roleUserRepository.deleteByUserId(userId);
    }

    /**
     * Obtener todos los usuarios de un rol
     */
    @Transactional(readOnly = true)
    public List<Long> getUsersByRole(Long roleId) {
        if (!roleRepository.existsById(roleId)) {
            throw new ResourceNotFoundException("Rol no encontrado con ID: " + roleId);
        }

        return roleUserRepository.findUserIdsByRoleId(roleId);
    }
}
