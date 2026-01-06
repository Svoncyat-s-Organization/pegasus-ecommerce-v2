package com.pegasus.backend.features.user.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.user.dto.ChangePasswordRequest;
import com.pegasus.backend.features.user.dto.UpdateUserRequest;
import com.pegasus.backend.features.user.dto.UserResponse;
import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.features.user.mapper.UserMapper;
import com.pegasus.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para gestión de perfil de usuario autenticado
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Obtener perfil del usuario autenticado
     */
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        log.info("Perfil obtenido para usuario ID: {}", userId);
        return userMapper.toResponse(user);
    }

    /**
     * Actualizar perfil del usuario autenticado
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        // Verificar si el email ya existe (excepto el usuario actual)
        if (!user.getEmail().equals(request.email())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new IllegalArgumentException("El email ya está en uso");
            }
        }

        // Verificar si el username ya existe (excepto el usuario actual)
        if (!user.getUsername().equals(request.username())) {
            if (userRepository.existsByUsername(request.username())) {
                throw new IllegalArgumentException("El username ya está en uso");
            }
        }

        // Actualizar datos
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setDocType(request.docType());
        user.setDocNumber(request.docNumber());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        user.setIsActive(request.isActive());

        User updated = userRepository.save(user);
        log.info("Perfil actualizado para usuario ID: {}", userId);

        return userMapper.toResponse(updated);
    }

    /**
     * Cambiar contraseña del usuario autenticado
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));

        // Encriptar y actualizar contraseña
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        log.info("Contraseña actualizada para usuario ID: {}", userId);
    }
}
