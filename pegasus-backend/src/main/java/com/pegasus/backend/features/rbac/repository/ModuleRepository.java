package com.pegasus.backend.features.rbac.repository;

import com.pegasus.backend.features.rbac.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para Module
 */
@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {

    Optional<Module> findByPath(String path);

    boolean existsByPath(String path);
}
