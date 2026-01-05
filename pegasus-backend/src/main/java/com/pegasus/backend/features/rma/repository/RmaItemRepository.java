package com.pegasus.backend.features.rma.repository;

import com.pegasus.backend.features.rma.entity.RmaItem;
import com.pegasus.backend.shared.enums.ItemCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para la entidad RmaItem
 */
@Repository
public interface RmaItemRepository extends JpaRepository<RmaItem, Long> {

    /**
     * Buscar items por RMA
     */
    List<RmaItem> findByRmaId(Long rmaId);

    /**
     * Buscar items por order_item
     */
    List<RmaItem> findByOrderItemId(Long orderItemId);

    /**
     * Buscar items por variante
     */
    List<RmaItem> findByVariantId(Long variantId);

    /**
     * Buscar items pendientes de inspección
     */
    @Query("""
            SELECT ri FROM RmaItem ri
            JOIN ri.rma r
            WHERE r.status = 'RECEIVED'
            AND ri.itemCondition IS NULL
            """)
    List<RmaItem> findItemsAwaitingInspection();

    /**
     * Buscar items aprobados para restock
     */
    @Query("""
            SELECT ri FROM RmaItem ri
            JOIN ri.rma r
            WHERE r.status IN ('INSPECTING', 'REFUNDED', 'CLOSED')
            AND ri.restockApproved = true
            AND ri.itemCondition IN :restockableConditions
            """)
    List<RmaItem> findItemsApprovedForRestock(
            @Param("restockableConditions") List<ItemCondition> restockableConditions
    );

    /**
     * Contar items pendientes de inspección por RMA
     */
    @Query("""
            SELECT COUNT(ri) FROM RmaItem ri
            WHERE ri.rmaId = :rmaId
            AND ri.itemCondition IS NULL
            """)
    Long countUninspectedItemsByRma(@Param("rmaId") Long rmaId);

    /**
     * Verificar si todos los items de una RMA han sido inspeccionados
     */
    @Query("""
            SELECT COUNT(ri) = 0 FROM RmaItem ri
            WHERE ri.rmaId = :rmaId
            AND ri.itemCondition IS NULL
            """)
    boolean areAllItemsInspected(@Param("rmaId") Long rmaId);
}
