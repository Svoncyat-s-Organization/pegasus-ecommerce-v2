package com.pegasus.backend.features.rma.repository;

import com.pegasus.backend.features.rma.entity.Rma;
import com.pegasus.backend.shared.enums.RmaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para la entidad Rma
 */
@Repository
public interface RmaRepository extends JpaRepository<Rma, Long> {

    /**
     * Buscar RMA por número
     */
    Optional<Rma> findByRmaNumber(String rmaNumber);

    /**
     * Buscar RMAs por cliente con paginación
     */
    Page<Rma> findByCustomerId(Long customerId, Pageable pageable);

    /**
     * Buscar RMAs por orden con paginación
     */
    Page<Rma> findByOrderId(Long orderId, Pageable pageable);

    /**
     * Buscar RMAs por estado con paginación
     */
    Page<Rma> findByStatus(RmaStatus status, Pageable pageable);

    /**
     * Buscar RMAs por rango de fecha
     */
    Page<Rma> findByCreatedAtBetween(
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Pageable pageable
    );

    /**
     * Contar RMAs por estado
     */
    Long countByStatus(RmaStatus status);

    /**
     * Buscar RMAs pendientes de aprobación
     */
    Page<Rma> findByStatusIn(List<RmaStatus> statuses, Pageable pageable);

    /**
     * Verificar si existe RMA pendiente/aprobada para un order_item específico
     */
    @Query("""
            SELECT COUNT(r) > 0 FROM Rma r
            JOIN r.items ri
            WHERE ri.orderItemId = :orderItemId
            AND r.status IN ('PENDING', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'INSPECTING', 'REFUNDED')
            """)
    boolean existsPendingRmaForOrderItem(@Param("orderItemId") Long orderItemId);

    /**
     * Búsqueda completa con filtros opcionales
     * Busca por número de RMA, número de orden, nombre de cliente
     */
    @Query("""
            SELECT r FROM Rma r
            LEFT JOIN r.customer c
            LEFT JOIN r.order o
            WHERE (:search IS NULL OR :search = '' OR
                   LOWER(r.rmaNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:status IS NULL OR r.status = :status)
            AND (:customerId IS NULL OR r.customerId = :customerId)
            """)
    Page<Rma> searchRmas(
            @Param("search") String search,
            @Param("status") RmaStatus status,
            @Param("customerId") Long customerId,
            Pageable pageable
    );

    /**
     * Obtener RMAs que necesitan inspección
     */
    @Query("""
            SELECT r FROM Rma r
            WHERE r.status = 'RECEIVED'
            ORDER BY r.receivedAt ASC
            """)
    Page<Rma> findRmasAwaitingInspection(Pageable pageable);

    /**
     * Obtener RMAs que necesitan procesamiento de reembolso
     */
    @Query("""
            SELECT r FROM Rma r
            WHERE r.status = 'INSPECTING'
            AND NOT EXISTS (
                SELECT 1 FROM RmaItem ri
                WHERE ri.rmaId = r.id
                AND ri.itemCondition IS NULL
            )
            ORDER BY r.createdAt ASC
            """)
    Page<Rma> findRmasReadyForRefund(Pageable pageable);
}
