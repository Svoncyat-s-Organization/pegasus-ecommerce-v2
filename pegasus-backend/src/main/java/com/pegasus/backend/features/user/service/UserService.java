package com.pegasus.backend.features.user.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.user.dto.ChangePasswordRequest;
import com.pegasus.backend.features.user.dto.CreateUserRequest;
import com.pegasus.backend.features.user.dto.UpdateUserRequest;
import com.pegasus.backend.features.user.dto.UserResponse;
import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.features.user.mapper.UserMapper;
import com.pegasus.backend.features.user.repository.UserRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de gestión de usuarios backoffice
 * Maneja CRUD y lógica de negocio de User
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Obtener todos los usuarios (paginado y con búsqueda opcional)
     * @param search Término de búsqueda (username, email, firstName, lastName)
     * @param pageable Configuración de paginación
     */
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(String search, Pageable pageable) {
        Page<User> page;
        
        if (search != null && !search.isBlank()) {
            page = userRepository.searchUsers(search.trim(), pageable);
        } else {
            page = userRepository.findAll(pageable);
        }
        
        return new PageResponse<>(
                page.getContent().stream().map(userMapper::toResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Obtener usuario por ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return userMapper.toResponse(user);
    }

    /**
     * Crear nuevo usuario
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        // Validar duplicados
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("El username ya está en uso");
        }

        // Mapear y hashear password
        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    /**
     * Actualizar usuario existente
     */
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserById(id);

        // Validar duplicados (excluyendo el usuario actual)
        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        if (!user.getUsername().equals(request.username()) && userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("El username ya está en uso");
        }

        userMapper.updateEntity(request, user);
        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    /**
     * Cambiar contraseña de usuario
     */
    @Transactional
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = findUserById(id);
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    /**
     * Activar/desactivar usuario (soft delete)
     */
    @Transactional
    public void toggleUserStatus(Long id) {
        User user = findUserById(id);
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    /**
     * Eliminar usuario permanentemente
     * Nota: Considerar restricciones FK antes de usar esto
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    // Helper method
    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }
}
