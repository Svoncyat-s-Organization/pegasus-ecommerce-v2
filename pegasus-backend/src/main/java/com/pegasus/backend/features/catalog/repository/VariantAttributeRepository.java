package com.pegasus.backend.features.catalog.repository;

import com.pegasus.backend.features.catalog.entity.VariantAttribute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para VariantAttribute
 */
@Repository
public interface VariantAttributeRepository extends JpaRepository<VariantAttribute, Long> {

    /**
     * Obtener todos los atributos activos ordenados por nombre
     */
    List<VariantAttribute> findByIsActiveTrueOrderByDisplayNameAsc();

    /**
     * Buscar por nombre (único)
     */
    Optional<VariantAttribute> findByName(String name);

    /**
     * Verificar si existe por nombre
     */
    boolean existsByName(String name);

    /**
     * Verificar si existe por nombre excluyendo un ID (para updates)
     */
    boolean existsByNameAndIdNot(String name, Long id);

    /**
     * Buscar atributos con paginación
     */
    Page<VariantAttribute> findByIsActiveTrue(Pageable pageable);

    /**
     * Búsqueda por texto en nombre o displayName
     */
    @Query("SELECT va FROM VariantAttribute va WHERE va.isActive = true AND " +
           "(LOWER(va.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(va.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(va.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<VariantAttribute> searchAttributes(@Param("search") String search, Pageable pageable);

    /**
     * Buscar por tipo de atributo
     */
    List<VariantAttribute> findByAttributeTypeAndIsActiveTrue(VariantAttribute.AttributeType attributeType);

    /**
     * Obtener atributos por lista de IDs
     */
    List<VariantAttribute> findByIdInAndIsActiveTrue(List<Long> ids);
}
