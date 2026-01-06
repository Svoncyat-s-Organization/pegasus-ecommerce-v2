package com.pegasus.backend.features.settings.repository;

import com.pegasus.backend.features.settings.entity.StorefrontSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StorefrontSettingsRepository extends JpaRepository<StorefrontSettings, Long> {

    /**
     * Obtiene el registro singleton (id = 1)
     */
    default Optional<StorefrontSettings> findSingleton() {
        return findById(1L);
    }
}
