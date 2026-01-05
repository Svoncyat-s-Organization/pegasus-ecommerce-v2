package com.pegasus.backend.features.settings.repository;

import com.pegasus.backend.features.settings.entity.BusinessInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessInfoRepository extends JpaRepository<BusinessInfo, Long> {

    /**
     * Obtiene el registro singleton (id = 1)
     */
    default Optional<BusinessInfo> findSingleton() {
        return findById(1L);
    }
}
