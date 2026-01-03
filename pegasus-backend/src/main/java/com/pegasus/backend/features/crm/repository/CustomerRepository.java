package com.pegasus.backend.features.crm.repository;

import com.pegasus.backend.features.crm.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para Customer (Storefront)
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByEmail(String email);
    
    Optional<Customer> findByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
}
