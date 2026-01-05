package com.pegasus.backend.features.logistic.repository;

import com.pegasus.backend.features.logistic.entity.ShippingMethod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Long> {

    @Query("SELECT sm FROM ShippingMethod sm WHERE " +
            "LOWER(sm.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(sm.carrier) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(sm.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<ShippingMethod> searchShippingMethods(@Param("search") String search, Pageable pageable);

    Page<ShippingMethod> findByIsActive(Boolean isActive, Pageable pageable);

    List<ShippingMethod> findByIsActiveTrue();
}
