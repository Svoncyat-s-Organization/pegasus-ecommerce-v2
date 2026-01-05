package com.pegasus.backend.features.logistic.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.logistic.dto.CreateShipmentRequest;
import com.pegasus.backend.features.logistic.dto.ShipmentResponse;
import com.pegasus.backend.features.logistic.dto.UpdateShipmentRequest;
import com.pegasus.backend.features.logistic.entity.Shipment;
import com.pegasus.backend.features.logistic.entity.ShippingMethod;
import com.pegasus.backend.features.logistic.mapper.ShipmentMapper;
import com.pegasus.backend.features.logistic.repository.ShipmentRepository;
import com.pegasus.backend.features.logistic.repository.ShippingMethodRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentMapper shipmentMapper;
    private final ShippingMethodRepository shippingMethodRepository;

    public PageResponse<ShipmentResponse> getAllShipments(String search, String status, String shipmentType,
            Pageable pageable) {
        log.debug("Getting all shipments with search: {}, status: {}, shipmentType: {}", search, status, shipmentType);

        Page<Shipment> page;

        if (search != null && !search.isBlank()) {
            page = shipmentRepository.searchShipments(search.trim(), pageable);
        } else if (status != null && !status.isBlank()) {
            page = shipmentRepository.findByStatus(status, pageable);
        } else if (shipmentType != null && !shipmentType.isBlank()) {
            page = shipmentRepository.findByShipmentType(shipmentType, pageable);
        } else {
            page = shipmentRepository.findAll(pageable);
        }

        List<ShipmentResponse> content = page.getContent().stream()
                .map(shipmentMapper::toResponse)
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

    public PageResponse<ShipmentResponse> getShipmentsByOrder(Long orderId, Pageable pageable) {
        log.debug("Getting shipments for order: {}", orderId);

        Page<Shipment> page = shipmentRepository.findByOrderId(orderId, pageable);

        List<ShipmentResponse> content = page.getContent().stream()
                .map(shipmentMapper::toResponse)
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

    public ShipmentResponse getShipmentById(Long id) {
        log.debug("Getting shipment by id: {}", id);

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con ID: " + id));

        return shipmentMapper.toResponse(shipment);
    }

    public List<ShipmentResponse> getShipmentsByTrackingNumber(String trackingNumber) {
        log.debug("Getting shipments by tracking number: {}", trackingNumber);

        List<Shipment> shipments = shipmentRepository.findByTrackingNumber(trackingNumber);

        return shipments.stream()
                .map(shipmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        log.info("Creating shipment for order: {}", request.getOrderId());

        ShippingMethod shippingMethod = shippingMethodRepository.findById(request.getShippingMethodId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Método de envío no encontrado con ID: " + request.getShippingMethodId()));

        Shipment shipment = shipmentMapper.toEntity(request);
        shipment.setOrderId(request.getOrderId());
        shipment.setShippingMethod(shippingMethod);

        Shipment saved = shipmentRepository.save(shipment);

        log.info("Shipment created successfully with tracking number: {}", saved.getTrackingNumber());
        return shipmentMapper.toResponse(saved);
    }

    @Transactional
    public ShipmentResponse updateShipment(Long id, UpdateShipmentRequest request) {
        log.info("Updating shipment with id: {}", id);

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con ID: " + id));

        shipmentMapper.updateEntityFromRequest(request, shipment);
        Shipment updated = shipmentRepository.save(shipment);

        log.info("Shipment updated successfully: {}", updated.getTrackingNumber());
        return shipmentMapper.toResponse(updated);
    }

    @Transactional
    public void deleteShipment(Long id) {
        log.info("Deleting shipment with id: {}", id);

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con ID: " + id));

        shipment.setIsActive(false);
        shipmentRepository.save(shipment);

        log.info("Shipment deleted successfully: {}", shipment.getTrackingNumber());
    }
}
