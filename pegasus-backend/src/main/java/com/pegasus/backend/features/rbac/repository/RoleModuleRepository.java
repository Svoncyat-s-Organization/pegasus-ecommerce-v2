package com.pegasus.backend.features.rbac.repository;

import com.pegasus.backend.features.rbac.entity.RoleModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para RoleModule
 * Maneja la relación entre Role y Module
 */
@Repository
public interface RoleModuleRepository extends JpaRepository<RoleModule, RoleModule.RoleModuleId> {

    /**
     * Encontrar todos los módulos de un rol específico
     */
    List<RoleModule> findByRoleId(Long roleId);

    /**
     * Encontrar todos los roles que tienen acceso a un módulo específico
     */
    List<RoleModule> findByModuleId(Long moduleId);

    /**
     * Verificar si un rol tiene acceso a un módulo
     */
    boolean existsByRoleIdAndModuleId(Long roleId, Long moduleId);

    /**
     * Eliminar todos los permisos de un rol
     */
    void deleteByRoleId(Long roleId);

    /**
     * Eliminar un permiso específico
     */
    void deleteByRoleIdAndModuleId(Long roleId, Long moduleId);

    /**
     * Obtener IDs de módulos por roleId (Query optimizada)
     */
    @Query("SELECT rm.moduleId FROM RoleModule rm WHERE rm.roleId = :roleId")
    List<Long> findModuleIdsByRoleId(@Param("roleId") Long roleId);
}
