package com.pegasus.backend.features.inventory.repository;

import com.pegasus.backend.features.inventory.entity.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para la entidad Warehouse
 */
@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    /**
     * Buscar almacén por código
     */
    Optional<Warehouse> findByCode(String code);

    /**
     * Obtener todos los almacenes activos
     */
    List<Warehouse> findByIsActiveTrue();

    /**
     * Verificar si existe un código
     */
    boolean existsByCode(String code);

    /**
     * Verificar si existe un código diferente al ID dado (para updates)
     */
    boolean existsByCodeAndIdNot(String code, Long id);

    /**
     * Búsqueda compleja con filtros
     */
    @Query("""
            SELECT w FROM Warehouse w
            WHERE (:search IS NULL OR :search = '' OR
                   LOWER(w.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(w.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(w.address) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:isActive IS NULL OR w.isActive = :isActive)
            """)
    Page<Warehouse> searchWarehouses(
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

    /**
     * Verificar si un almacén tiene stock
     */
    @Query("""
            SELECT COUNT(s) > 0 FROM Stock s
            WHERE s.warehouse.id = :warehouseId
            AND (s.quantity > 0 OR s.reservedQuantity > 0)
            """)
    boolean hasStock(@Param("warehouseId") Long warehouseId);
}
