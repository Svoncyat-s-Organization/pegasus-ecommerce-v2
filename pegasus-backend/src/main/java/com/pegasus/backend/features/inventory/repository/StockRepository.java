package com.pegasus.backend.features.inventory.repository;

import com.pegasus.backend.features.inventory.entity.Stock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para la entidad Stock
 */
@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    /**
     * Buscar stock por almacén y variante
     */
    Optional<Stock> findByWarehouseIdAndVariantId(Long warehouseId, Long variantId);

    /**
     * Buscar todo el stock de una variante en todos los almacenes
     */
    List<Stock> findByVariantId(Long variantId);

    /**
     * Buscar todo el stock de un almacén
     */
    Page<Stock> findByWarehouseId(Long warehouseId, Pageable pageable);

    /**
     * Calcular stock total de una variante sumando todos los almacenes
     */
    @Query("""
            SELECT COALESCE(SUM(s.quantity), 0) 
            FROM Stock s 
            WHERE s.variantId = :variantId
            """)
    Integer getTotalStockByVariant(@Param("variantId") Long variantId);

    /**
     * Calcular stock disponible total (quantity - reservedQuantity)
     */
    @Query("""
            SELECT COALESCE(SUM(s.quantity - s.reservedQuantity), 0)
            FROM Stock s
            WHERE s.variantId = :variantId
            """)
    Integer getTotalAvailableStockByVariant(@Param("variantId") Long variantId);

    /**
     * Buscar stocks con cantidad baja (menor a un umbral)
     */
    @Query("""
            SELECT s FROM Stock s
            WHERE s.warehouseId = :warehouseId
            AND (s.quantity - s.reservedQuantity) <= :threshold
            ORDER BY (s.quantity - s.reservedQuantity) ASC
            """)
    List<Stock> findLowStockByWarehouse(
            @Param("warehouseId") Long warehouseId,
            @Param("threshold") Integer threshold
    );

    /**
     * Verificar si hay stock disponible suficiente
     */
    @Query("""
            SELECT CASE WHEN (s.quantity - s.reservedQuantity) >= :requiredQuantity 
                   THEN true ELSE false END
            FROM Stock s
            WHERE s.warehouseId = :warehouseId
            AND s.variantId = :variantId
            """)
    Boolean hasAvailableStock(
            @Param("warehouseId") Long warehouseId,
            @Param("variantId") Long variantId,
            @Param("requiredQuantity") Integer requiredQuantity
    );

    /**
     * Eliminar todos los stocks de una variante (para hard delete)
     */
    void deleteByVariantId(Long variantId);
}
