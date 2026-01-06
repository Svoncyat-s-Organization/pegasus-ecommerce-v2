package com.pegasus.backend.features.invoice.repository;

import com.pegasus.backend.features.invoice.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByOrderId(Long orderId);

    Page<Payment> findByOrderId(Long orderId, Pageable pageable);

    Page<Payment> findByPaymentMethodId(Long paymentMethodId, Pageable pageable);

    Page<Payment> findByOrderIdAndPaymentMethodId(Long orderId, Long paymentMethodId, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE LOWER(COALESCE(p.transactionId, '')) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Payment> searchByTransactionId(@Param("search") String search, Pageable pageable);
}
