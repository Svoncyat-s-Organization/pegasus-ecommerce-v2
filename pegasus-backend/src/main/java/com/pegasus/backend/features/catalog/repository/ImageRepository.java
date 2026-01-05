package com.pegasus.backend.features.catalog.repository;

import com.pegasus.backend.features.catalog.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para Image
 */
@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByProductIdOrderByDisplayOrderAsc(Long productId);

    List<Image> findByVariantIdOrderByDisplayOrderAsc(Long variantId);

    @Query("SELECT i FROM Image i WHERE i.productId = :productId AND i.variantId IS NULL ORDER BY i.displayOrder ASC")
    List<Image> findProductImagesOnly(@Param("productId") Long productId);

    Optional<Image> findByProductIdAndIsPrimaryTrue(Long productId);

    Optional<Image> findByVariantIdAndIsPrimaryTrue(Long variantId);

    void deleteByProductId(Long productId);

    void deleteByVariantId(Long variantId);
}
