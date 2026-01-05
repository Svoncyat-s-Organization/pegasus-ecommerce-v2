package com.pegasus.backend.features.rma.repository;

import com.pegasus.backend.features.rma.entity.RmaStatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para la entidad RmaStatusHistory
 */
@Repository
public interface RmaStatusHistoryRepository extends JpaRepository<RmaStatusHistory, Long> {

    /**
     * Buscar historial por RMA ordenado por fecha descendente
     */
    List<RmaStatusHistory> findByRmaIdOrderByCreatedAtDesc(Long rmaId);

    /**
     * Buscar historial por RMA con paginación
     */
    Page<RmaStatusHistory> findByRmaId(Long rmaId, Pageable pageable);

    /**
     * Buscar historial por usuario que creó el cambio
     */
    Page<RmaStatusHistory> findByCreatedBy(Long createdBy, Pageable pageable);

    /**
     * Obtener el último estado registrado de una RMA
     */
    @Query("""
            SELECT h FROM RmaStatusHistory h
            WHERE h.rmaId = :rmaId
            ORDER BY h.createdAt DESC
            LIMIT 1
            """)
    RmaStatusHistory findLatestByRmaId(@Param("rmaId") Long rmaId);
}
