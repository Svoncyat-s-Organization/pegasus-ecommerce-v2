package com.pegasus.backend.features.catalog.repository;

import com.pegasus.backend.features.catalog.entity.Variant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para Variant
 */
@Repository
public interface VariantRepository extends JpaRepository<Variant, Long> {

    Optional<Variant> findBySku(String sku);

    boolean existsBySku(String sku);

    List<Variant> findByProductId(Long productId);

    @Query("SELECT v FROM Variant v WHERE v.productId = :productId AND v.isActive = true")
    List<Variant> findActiveByProductId(@Param("productId") Long productId);

    @Query("SELECT v FROM Variant v WHERE " +
           "LOWER(v.sku) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Variant> searchVariants(@Param("search") String search, Pageable pageable);

    @Query("SELECT v FROM Variant v JOIN FETCH v.product WHERE v.isActive = true ORDER BY v.sku")
    Page<Variant> findAllActiveVariants(Pageable pageable);
}
