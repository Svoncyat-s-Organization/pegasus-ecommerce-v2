package com.pegasus.backend.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Proveedor JWT - Genera y valida tokens
 * Con claim custom: userType (ADMIN o CUSTOMER)
 */
@Component
@Slf4j
public class JwtProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Genera un token JWT para un usuario
     * @param userId ID del usuario o cliente
     * @param userType Tipo: "ADMIN" o "CUSTOMER"
     * @return Token JWT firmado
     */
    public String generateToken(Long userId, String userType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("userType", userType)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extrae el userId del token
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    /**
     * Extrae el userType (ADMIN o CUSTOMER) del token
     */
    public String getUserTypeFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.get("userType", String.class);
    }

    /**
     * Valida el token JWT
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Obtiene los claims del token
     */
    private Claims getClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
