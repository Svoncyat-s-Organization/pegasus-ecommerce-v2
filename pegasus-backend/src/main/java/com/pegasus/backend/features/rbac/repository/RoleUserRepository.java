package com.pegasus.backend.features.rbac.repository;

import com.pegasus.backend.features.rbac.entity.RoleUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para RoleUser
 * Maneja la relación entre Role y User
 */
@Repository
public interface RoleUserRepository extends JpaRepository<RoleUser, RoleUser.RoleUserId> {

    /**
     * Encontrar todos los roles de un usuario
     */
    List<RoleUser> findByUserId(Long userId);

    /**
     * Encontrar todos los usuarios de un rol
     */
    List<RoleUser> findByRoleId(Long roleId);

    /**
     * Verificar si un usuario tiene un rol asignado
     */
    boolean existsByRoleIdAndUserId(Long roleId, Long userId);

    /**
     * Eliminar todos los roles de un usuario
     */
    void deleteByUserId(Long userId);

    /**
     * Eliminar una asignación específica
     */
    void deleteByRoleIdAndUserId(Long roleId, Long userId);

    /**
     * Obtener IDs de roles por userId (Query optimizada)
     */
    @Query("SELECT ru.roleId FROM RoleUser ru WHERE ru.userId = :userId")
    List<Long> findRoleIdsByUserId(@Param("userId") Long userId);

    /**
     * Obtener IDs de usuarios por roleId (Query optimizada)
     */
    @Query("SELECT ru.userId FROM RoleUser ru WHERE ru.roleId = :roleId")
    List<Long> findUserIdsByRoleId(@Param("roleId") Long roleId);
}
