package com.pegasus.backend.features.logistic.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.logistic.dto.CreateTrackingEventRequest;
import com.pegasus.backend.features.logistic.dto.TrackingEventResponse;
import com.pegasus.backend.features.logistic.entity.Shipment;
import com.pegasus.backend.features.logistic.entity.TrackingEvent;
import com.pegasus.backend.features.logistic.mapper.TrackingEventMapper;
import com.pegasus.backend.features.logistic.repository.ShipmentRepository;
import com.pegasus.backend.features.logistic.repository.TrackingEventRepository;
import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.features.user.repository.UserRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TrackingEventService {

    private final TrackingEventRepository trackingEventRepository;
    private final TrackingEventMapper trackingEventMapper;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public PageResponse<TrackingEventResponse> getEventsByShipment(Long shipmentId, String search, Pageable pageable) {
        log.debug("Getting tracking events for shipment: {}", shipmentId);

        Page<TrackingEvent> page;

        if (search != null && !search.isBlank()) {
            page = trackingEventRepository.searchEventsByShipment(shipmentId, search.trim(), pageable);
        } else {
            page = trackingEventRepository.findByShipmentId(shipmentId, pageable);
        }

        List<TrackingEventResponse> content = page.getContent().stream()
                .map(trackingEventMapper::toResponse)
                .toList();

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    public List<TrackingEventResponse> getPublicEventsByShipment(Long shipmentId) {
        log.debug("Getting public tracking events for shipment: {}", shipmentId);

        List<TrackingEvent> events = trackingEventRepository.findPublicEventsByShipmentId(shipmentId);

        return events.stream()
                .map(trackingEventMapper::toResponse)
                .toList();
    }

    public TrackingEventResponse getTrackingEventById(Long id) {
        log.debug("Getting tracking event by id: {}", id);

        TrackingEvent trackingEvent = trackingEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento de tracking no encontrado con ID: " + id));

        return trackingEventMapper.toResponse(trackingEvent);
    }

    @Transactional
    public TrackingEventResponse createTrackingEvent(CreateTrackingEventRequest request) {
        log.info("Creating tracking event for shipment: {}", request.getShipmentId());

        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Envío no encontrado con ID: " + request.getShipmentId()));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        TrackingEvent trackingEvent = trackingEventMapper.toEntity(request);
        trackingEvent.setShipment(shipment);
        trackingEvent.setCreatedBy(user);

        if (request.getEventDate() == null) {
            trackingEvent.setEventDate(OffsetDateTime.now());
        }

        TrackingEvent saved = trackingEventRepository.save(trackingEvent);

        log.info("Tracking event created successfully for shipment: {}", shipment.getTrackingNumber());
        return trackingEventMapper.toResponse(saved);
    }

    @Transactional
    public void deleteTrackingEvent(Long id) {
        log.info("Deleting tracking event with id: {}", id);

        TrackingEvent trackingEvent = trackingEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento de tracking no encontrado con ID: " + id));

        trackingEventRepository.delete(trackingEvent);

        log.info("Tracking event deleted successfully");
    }
}
