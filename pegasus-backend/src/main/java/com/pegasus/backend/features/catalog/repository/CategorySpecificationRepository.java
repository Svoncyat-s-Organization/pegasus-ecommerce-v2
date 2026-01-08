package com.pegasus.backend.features.catalog.repository;

import com.pegasus.backend.features.catalog.entity.CategorySpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para CategorySpecification
 */
@Repository
public interface CategorySpecificationRepository extends JpaRepository<CategorySpecification, Long> {

    /**
     * Obtener especificaciones de una categoría ordenadas por posición
     */
    List<CategorySpecification> findByCategoryIdOrderByPositionAsc(Long categoryId);

    /**
     * Obtener especificaciones activas de una categoría
     */
    List<CategorySpecification> findByCategoryIdAndIsActiveTrueOrderByPositionAsc(Long categoryId);

    /**
     * Verificar si existe una especificación con el mismo nombre en la categoría
     */
    boolean existsByCategoryIdAndName(Long categoryId, String name);

    /**
     * Verificar existencia excluyendo un ID específico (para updates)
     */
    boolean existsByCategoryIdAndNameAndIdNot(Long categoryId, String name, Long id);

    /**
     * Obtener especificaciones de múltiples categorías (para herencia)
     */
    @Query("SELECT cs FROM CategorySpecification cs WHERE cs.categoryId IN :categoryIds AND cs.isActive = true ORDER BY cs.categoryId, cs.position")
    List<CategorySpecification> findByCategoryIdInAndIsActiveTrue(@Param("categoryIds") List<Long> categoryIds);

    /**
     * Contar especificaciones activas de una categoría
     */
    long countByCategoryIdAndIsActiveTrue(Long categoryId);
}
