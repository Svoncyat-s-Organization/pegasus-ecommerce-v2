package com.pegasus.backend.security.auth.service;

import com.pegasus.backend.shared.enums.DocumentType;
import com.pegasus.backend.features.customer.entity.Customer;
import com.pegasus.backend.features.customer.repository.CustomerRepository;
import com.pegasus.backend.security.auth.dto.AuthResponse;
import com.pegasus.backend.security.auth.dto.LoginRequest;
import com.pegasus.backend.security.auth.dto.RegisterCustomerRequest;
import com.pegasus.backend.security.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de autenticación para clientes storefront
 */
@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Login de clientes (Storefront)
     * Acepta username o email
     */
    public AuthResponse login(LoginRequest request) {
        // Intentar buscar por email primero, luego por username
        Customer customer = customerRepository.findByEmail(request.usernameOrEmail())
                .or(() -> customerRepository.findByUsername(request.usernameOrEmail()))
                .orElseThrow(() -> new UsernameNotFoundException("Cliente no encontrado"));

        if (!customer.getIsActive()) {
            throw new BadCredentialsException("Cliente inactivo");
        }

        if (!passwordEncoder.matches(request.password(), customer.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String token = jwtUtils.generateToken(customer.getId(), "CUSTOMER");

        return AuthResponse.builder()
                .token(token)
                .userType("CUSTOMER")
                .userId(customer.getId())
                .email(customer.getEmail())
                .expiresIn(jwtExpirationMs)
                .build();
    }

    /**
     * Registro de nuevos clientes
     */
    @Transactional
    public AuthResponse register(RegisterCustomerRequest request) {
        if (customerRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        if (customerRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("El username ya está en uso");
        }

        Customer customer = Customer.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .docType(DocumentType.valueOf(request.docType()))
                .docNumber(request.docNumber())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .build();
        
        customer.setIsActive(true);

        customer = customerRepository.save(customer);

        String token = jwtUtils.generateToken(customer.getId(), "CUSTOMER");

        return AuthResponse.builder()
                .token(token)
                .userType("CUSTOMER")
                .userId(customer.getId())
                .email(customer.getEmail())
                .expiresIn(jwtExpirationMs)
                .build();
    }
}
