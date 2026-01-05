package com.pegasus.backend.features.logistic.controller;

import com.pegasus.backend.features.logistic.dto.CreateTrackingEventRequest;
import com.pegasus.backend.features.logistic.dto.TrackingEventResponse;
import com.pegasus.backend.features.logistic.service.TrackingEventService;
import com.pegasus.backend.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tracking-events")
@RequiredArgsConstructor
@Tag(name = "Tracking Events", description = "Gestión de eventos de tracking")
public class TrackingEventController {

    private final TrackingEventService trackingEventService;

    @GetMapping("/shipment/{shipmentId}")
    @Operation(summary = "Obtener eventos de tracking por envío")
    public ResponseEntity<PageResponse<TrackingEventResponse>> getEventsByShipment(
            @PathVariable Long shipmentId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(trackingEventService.getEventsByShipment(shipmentId, search, pageable));
    }

    @GetMapping("/shipment/{shipmentId}/public")
    @Operation(summary = "Obtener eventos públicos de tracking por envío")
    public ResponseEntity<List<TrackingEventResponse>> getPublicEventsByShipment(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(trackingEventService.getPublicEventsByShipment(shipmentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener evento de tracking por ID")
    public ResponseEntity<TrackingEventResponse> getTrackingEventById(@PathVariable Long id) {
        return ResponseEntity.ok(trackingEventService.getTrackingEventById(id));
    }

    @PostMapping
    @Operation(summary = "Crear evento de tracking")
    public ResponseEntity<TrackingEventResponse> createTrackingEvent(
            @Valid @RequestBody CreateTrackingEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(trackingEventService.createTrackingEvent(request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar evento de tracking")
    public ResponseEntity<Void> deleteTrackingEvent(@PathVariable Long id) {
        trackingEventService.deleteTrackingEvent(id);
        return ResponseEntity.noContent().build();
    }
}
