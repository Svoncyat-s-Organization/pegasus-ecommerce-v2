package com.pegasus.backend.features.logistic.repository;

import com.pegasus.backend.features.logistic.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @Query("SELECT s FROM Shipment s WHERE " +
            "LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.recipientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.recipientPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.status) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Shipment> searchShipments(@Param("search") String search, Pageable pageable);

    Page<Shipment> findByOrderId(Long orderId, Pageable pageable);

    Page<Shipment> findByStatus(String status, Pageable pageable);

    Page<Shipment> findByShipmentType(String shipmentType, Pageable pageable);

    List<Shipment> findByTrackingNumber(String trackingNumber);
}
