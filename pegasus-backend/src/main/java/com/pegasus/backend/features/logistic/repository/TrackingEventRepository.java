package com.pegasus.backend.features.logistic.repository;

import com.pegasus.backend.features.logistic.entity.TrackingEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {

    @Query("SELECT te FROM TrackingEvent te WHERE te.shipment.id = :shipmentId ORDER BY te.eventDate DESC")
    Page<TrackingEvent> findByShipmentId(@Param("shipmentId") Long shipmentId, Pageable pageable);

    @Query("SELECT te FROM TrackingEvent te WHERE te.shipment.id = :shipmentId AND te.isPublic = true ORDER BY te.eventDate DESC")
    List<TrackingEvent> findPublicEventsByShipmentId(@Param("shipmentId") Long shipmentId);

    @Query("SELECT te FROM TrackingEvent te WHERE " +
            "te.shipment.id = :shipmentId AND (" +
            "LOWER(te.status) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(te.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(te.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<TrackingEvent> searchEventsByShipment(@Param("shipmentId") Long shipmentId, @Param("search") String search,
            Pageable pageable);
}
