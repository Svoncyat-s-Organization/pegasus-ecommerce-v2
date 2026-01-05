package com.pegasus.backend.features.invoice.repository;

import com.pegasus.backend.features.invoice.entity.Invoice;
import com.pegasus.backend.features.invoice.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    boolean existsBySeriesAndNumber(String series, String number);

    Optional<Invoice> findByOrderId(Long orderId);

    Optional<Invoice> findBySeriesAndNumber(String series, String number);

    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE " +
            "LOWER(i.series) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.number) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.receiverName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.receiverTaxId) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Invoice> search(@Param("search") String search, Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.status = :status AND (" +
            "LOWER(i.series) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.number) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.receiverName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(i.receiverTaxId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Invoice> searchByStatus(@Param("search") String search, @Param("status") InvoiceStatus status, Pageable pageable);
}
