package com.pegasus.backend.features.rbac.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Entidad RoleUser - Relación muchos a muchos entre Role y User
 * Tabla: roles_users
 * Asigna roles a usuarios
 */
@Entity
@Table(name = "roles_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(RoleUser.RoleUserId.class)
public class RoleUser {

    @Id
    @Column(name = "id_roles")
    private Long roleId;

    @Id
    @Column(name = "id_users")
    private Long userId;

    /**
     * Clase compuesta para la clave primaria
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleUserId implements Serializable {
        private Long roleId;
        private Long userId;
    }
}
