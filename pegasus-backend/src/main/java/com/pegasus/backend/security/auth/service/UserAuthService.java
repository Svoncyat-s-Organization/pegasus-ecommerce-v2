package com.pegasus.backend.security.auth.service;

import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.features.user.repository.UserRepository;
import com.pegasus.backend.security.auth.dto.AuthResponse;
import com.pegasus.backend.security.auth.dto.LoginRequest;
import com.pegasus.backend.security.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Servicio de autenticación para usuarios backoffice (Admin/Workers)
 */
@Service
@RequiredArgsConstructor
public class UserAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Login de usuarios backoffice (Admin)
     * Acepta username o email
     */
    public AuthResponse login(LoginRequest request) {
        // Intentar buscar por email primero, luego por username
        User user = userRepository.findByEmail(request.usernameOrEmail())
                .or(() -> userRepository.findByUsername(request.usernameOrEmail()))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if (!user.getIsActive()) {
            throw new BadCredentialsException("Usuario inactivo");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String token = jwtUtils.generateToken(user.getId(), "ADMIN");

        return AuthResponse.builder()
                .token(token)
                .userType("ADMIN")
                .userId(user.getId())
                .email(user.getEmail())
                .expiresIn(jwtExpirationMs)
                .build();
    }
}
