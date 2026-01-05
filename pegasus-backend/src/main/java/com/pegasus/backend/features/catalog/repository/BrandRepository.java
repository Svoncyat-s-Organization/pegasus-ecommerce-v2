package com.pegasus.backend.features.catalog.repository;

import com.pegasus.backend.features.catalog.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository para Brand
 */
@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findBySlug(String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    @Query("SELECT b FROM Brand b WHERE " +
           "LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.slug) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Brand> searchBrands(@Param("search") String search, Pageable pageable);
}
