package com.pegasus.backend.security.auth.service;

import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.features.user.repository.UserRepository;
import com.pegasus.backend.security.auth.dto.AuthResponse;
import com.pegasus.backend.security.auth.dto.LoginRequest;
import com.pegasus.backend.security.jwt.JwtProvider;
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
    private final JwtProvider jwtProvider;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Login de usuarios backoffice (Admin)
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if (!user.getIsActive()) {
            throw new BadCredentialsException("Usuario inactivo");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String token = jwtProvider.generateToken(user.getId(), "ADMIN");

        return AuthResponse.builder()
                .token(token)
                .userType("ADMIN")
                .userId(user.getId())
                .email(user.getEmail())
                .expiresIn(jwtExpirationMs)
                .build();
    }
}
