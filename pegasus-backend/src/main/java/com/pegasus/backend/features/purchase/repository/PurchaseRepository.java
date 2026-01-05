package com.pegasus.backend.features.purchase.repository;

import com.pegasus.backend.features.purchase.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @Query("SELECT p FROM Purchase p " +
            "JOIN p.supplier s " +
            "WHERE LOWER(p.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.invoiceType) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(s.docNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Purchase> search(@Param("search") String search, Pageable pageable);
}
