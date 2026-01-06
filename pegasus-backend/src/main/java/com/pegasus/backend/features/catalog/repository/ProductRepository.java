package com.pegasus.backend.features.catalog.repository;

import com.pegasus.backend.features.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para Product
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByCode(String code);

    Optional<Product> findBySlug(String slug);

    boolean existsByCode(String code);

    boolean existsBySlug(String slug);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByBrandId(Long brandId);

    Page<Product> findByIsFeaturedTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Product> searchProducts(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId AND p.isActive = true")
    Page<Product> findActiveByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.brandId = :brandId AND p.isActive = true")
    Page<Product> findActiveByBrandId(@Param("brandId") Long brandId, Pageable pageable);

    long countByCategoryId(Long categoryId);
}
