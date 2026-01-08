package com.pegasus.backend.features.catalog.repository;

import com.pegasus.backend.features.catalog.entity.ProductVariantAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para ProductVariantAttribute
 */
@Repository
public interface ProductVariantAttributeRepository extends JpaRepository<ProductVariantAttribute, Long> {

    /**
     * Obtener atributos asignados a un producto ordenados por posición
     */
    List<ProductVariantAttribute> findByProductIdOrderByPositionAsc(Long productId);

    /**
     * Obtener atributos activos asignados a un producto
     */
    List<ProductVariantAttribute> findByProductIdAndIsActiveTrueOrderByPositionAsc(Long productId);

    /**
     * Verificar si existe la asignación producto-atributo
     */
    boolean existsByProductIdAndVariantAttributeId(Long productId, Long variantAttributeId);

    /**
     * Verificar existencia excluyendo un ID específico (para updates)
     */
    boolean existsByProductIdAndVariantAttributeIdAndIdNot(Long productId, Long variantAttributeId, Long id);

    /**
     * Eliminar todas las asignaciones de un producto
     */
    void deleteByProductId(Long productId);

    /**
     * Contar asignaciones activas de un producto
     */
    long countByProductIdAndIsActiveTrue(Long productId);

    /**
     * Obtener atributos con sus relaciones cargadas (para evitar N+1)
     */
    @Query("SELECT pva FROM ProductVariantAttribute pva " +
           "JOIN FETCH pva.variantAttribute va " +
           "WHERE pva.productId = :productId AND pva.isActive = true " +
           "ORDER BY pva.position")
    List<ProductVariantAttribute> findByProductIdWithAttributeDetails(@Param("productId") Long productId);
}
