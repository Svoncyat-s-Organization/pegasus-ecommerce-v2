package com.pegasus.backend.features.logistic.repository;

import com.pegasus.backend.features.logistic.entity.Shipment;
import com.pegasus.backend.shared.enums.ShipmentStatus;
import com.pegasus.backend.shared.enums.ShipmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @Query("SELECT s FROM Shipment s WHERE s.isActive = true AND (" +
            "LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.recipientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.recipientPhone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.status) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Shipment> searchShipments(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.isActive = true AND s.orderId = :orderId")
    Page<Shipment> findByOrderId(@Param("orderId") Long orderId, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.isActive = true AND s.status = :status")
    Page<Shipment> findByStatus(@Param("status") ShipmentStatus status, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.isActive = true AND s.shipmentType = :shipmentType")
    Page<Shipment> findByShipmentType(@Param("shipmentType") ShipmentType shipmentType, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.isActive = true AND s.trackingNumber = :trackingNumber")
    List<Shipment> findByTrackingNumber(@Param("trackingNumber") String trackingNumber);

    @Query("SELECT s FROM Shipment s WHERE s.isActive = true")
    Page<Shipment> findAllActive(Pageable pageable);

    @Query("SELECT COUNT(s) > 0 FROM Shipment s WHERE s.isActive = true AND s.shippingMethod.id = :shippingMethodId AND s.status IN ('PENDING', 'IN_TRANSIT')")
    boolean existsActiveShipmentsByShippingMethod(@Param("shippingMethodId") Long shippingMethodId);
}
