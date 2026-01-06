package com.pegasus.backend.features.inventory.repository;

import com.pegasus.backend.features.inventory.entity.Movement;
import com.pegasus.backend.shared.enums.OperationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Repository para la entidad Movement
 */
@Repository
public interface MovementRepository extends JpaRepository<Movement, Long> {

        /**
         * Buscar movimientos por almacén
         */
        Page<Movement> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId, Pageable pageable);

        /**
         * Buscar movimientos por variante
         */
        Page<Movement> findByVariantIdOrderByCreatedAtDesc(Long variantId, Pageable pageable);

        /**
         * Buscar movimientos por variante limitando a tipos permitidos (kardex MVP)
         */
        Page<Movement> findByVariantIdAndOperationTypeInOrderByCreatedAtDesc(
                        Long variantId,
                        List<OperationType> operationTypes,
                        Pageable pageable);

        /**
         * Buscar movimientos por almacén limitando a tipos permitidos (kardex MVP)
         */
        Page<Movement> findByWarehouseIdAndOperationTypeInOrderByCreatedAtDesc(
                        Long warehouseId,
                        List<OperationType> operationTypes,
                        Pageable pageable);

        /**
         * Buscar movimientos por tipo de operación
         */
        Page<Movement> findByOperationTypeOrderByCreatedAtDesc(OperationType operationType, Pageable pageable);

        /**
         * Buscar movimientos por referencia (tabla + ID)
         */
        List<Movement> findByReferenceTableAndReferenceIdOrderByCreatedAtDesc(
                        String referenceTable,
                        Long referenceId);

        /**
         * Buscar movimientos por referencia (tabla + ID) con paginación
         */
        Page<Movement> findByReferenceTableAndReferenceId(
                        String referenceTable,
                        Long referenceId,
                        Pageable pageable);

        /**
         * Buscar movimientos por referencia limitando a tipos permitidos (kardex MVP)
         */
        Page<Movement> findByReferenceTableAndReferenceIdAndOperationTypeIn(
                        String referenceTable,
                        Long referenceId,
                        List<OperationType> operationTypes,
                        Pageable pageable);

        /**
         * Buscar movimientos por referencia (con alias para compatibilidad)
         */
        default Page<Movement> findByReferenceIdAndReferenceTable(
                        Long referenceId,
                        String referenceTable,
                        Pageable pageable) {
                return findByReferenceTableAndReferenceId(referenceTable, referenceId, pageable);
        }

        /**
         * Buscar movimientos por rango de fechas
         */
        Page<Movement> findByCreatedAtBetweenOrderByCreatedAtDesc(
                        OffsetDateTime startDate,
                        OffsetDateTime endDate,
                        Pageable pageable);

        /**
         * Obtener último balance de una variante en un almacén
         */
        @Query("""
                        SELECT m.balance FROM Movement m
                        WHERE m.variantId = :variantId
                        AND m.warehouseId = :warehouseId
                        ORDER BY m.createdAt DESC
                        LIMIT 1
                        """)
        Integer getLastBalance(
                        @Param("variantId") Long variantId,
                        @Param("warehouseId") Long warehouseId);

        /**
         * Búsqueda compleja con múltiples filtros
         */
        @Query("""
                        SELECT m FROM Movement m
                        WHERE (:warehouseId IS NULL OR m.warehouseId = :warehouseId)
                        AND (:variantId IS NULL OR m.variantId = :variantId)
                        AND (:operationType IS NULL OR m.operationType = :operationType)
                        AND (:startDate IS NULL OR m.createdAt >= :startDate)
                        AND (:endDate IS NULL OR m.createdAt <= :endDate)
                        ORDER BY m.createdAt DESC
                        """)
        Page<Movement> searchMovements(
                        @Param("warehouseId") Long warehouseId,
                        @Param("variantId") Long variantId,
                        @Param("operationType") OperationType operationType,
                        @Param("startDate") OffsetDateTime startDate,
                        @Param("endDate") OffsetDateTime endDate,
                        Pageable pageable);

        /**
         * Búsqueda compleja limitada a un conjunto de tipos permitidos.
         */
        @Query("""
                            SELECT m FROM Movement m
                            WHERE m.operationType IN :allowedTypes
                        AND m.warehouseId = COALESCE(:warehouseId, m.warehouseId)
                        AND m.variantId = COALESCE(:variantId, m.variantId)
                        AND m.operationType = COALESCE(:operationType, m.operationType)
                        AND m.createdAt >= COALESCE(:startDate, m.createdAt)
                        AND m.createdAt <= COALESCE(:endDate, m.createdAt)
                            ORDER BY m.createdAt DESC
                            """)
        Page<Movement> searchMovementsAllowed(
                        @Param("allowedTypes") List<OperationType> allowedTypes,
                        @Param("warehouseId") Long warehouseId,
                        @Param("variantId") Long variantId,
                        @Param("operationType") OperationType operationType,
                        @Param("startDate") OffsetDateTime startDate,
                        @Param("endDate") OffsetDateTime endDate,
                        Pageable pageable);
}
