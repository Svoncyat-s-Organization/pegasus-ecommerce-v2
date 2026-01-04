package com.pegasus.backend.features.customer.repository;

import com.pegasus.backend.features.customer.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para CustomerAddress
 */
@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    
    List<CustomerAddress> findByCustomerId(Long customerId);
    
    Optional<CustomerAddress> findByIdAndCustomerId(Long id, Long customerId);
    
    Optional<CustomerAddress> findByCustomerIdAndIsDefaultShippingTrue(Long customerId);
    
    Optional<CustomerAddress> findByCustomerIdAndIsDefaultBillingTrue(Long customerId);
    
    @Modifying
    @Query("UPDATE CustomerAddress ca SET ca.isDefaultShipping = false WHERE ca.customer.id = :customerId")
    void clearDefaultShipping(@Param("customerId") Long customerId);
    
    @Modifying
    @Query("UPDATE CustomerAddress ca SET ca.isDefaultBilling = false WHERE ca.customer.id = :customerId")
    void clearDefaultBilling(@Param("customerId") Long customerId);
}
