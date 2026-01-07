package com.pegasus.backend.features.invoice.repository;

import com.pegasus.backend.features.invoice.entity.PaymentMethod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    boolean existsByName(String name);

    java.util.Optional<PaymentMethod> findByName(String name);

    @Query("SELECT pm FROM PaymentMethod pm WHERE LOWER(pm.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<PaymentMethod> search(@Param("search") String search, Pageable pageable);
}
