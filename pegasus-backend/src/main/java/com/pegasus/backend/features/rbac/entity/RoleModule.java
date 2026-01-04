package com.pegasus.backend.features.rbac.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Entidad RoleModule - Relación muchos a muchos entre Role y Module
 * Tabla: roles_modules
 * Define qué módulos puede acceder cada rol
 */
@Entity
@Table(name = "roles_modules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(RoleModule.RoleModuleId.class)
public class RoleModule {

    @Id
    @Column(name = "id_roles")
    private Long roleId;

    @Id
    @Column(name = "id_modules")
    private Long moduleId;

    /**
     * Clase compuesta para la clave primaria
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleModuleId implements Serializable {
        private Long roleId;
        private Long moduleId;
    }
}
