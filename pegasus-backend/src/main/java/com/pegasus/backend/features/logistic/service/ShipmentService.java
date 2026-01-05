package com.pegasus.backend.features.logistic.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.logistic.dto.CreateShipmentRequest;
import com.pegasus.backend.features.logistic.dto.ShipmentResponse;
import com.pegasus.backend.features.logistic.dto.UpdateShipmentRequest;
import com.pegasus.backend.features.logistic.entity.Shipment;
import com.pegasus.backend.features.logistic.entity.ShippingMethod;
import com.pegasus.backend.features.logistic.mapper.ShipmentMapper;
import com.pegasus.backend.features.logistic.repository.ShipmentRepository;
import com.pegasus.backend.features.logistic.repository.ShippingMethodRepository;
import com.pegasus.backend.features.order.entity.Order;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.features.inventory.service.StockService;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.OrderStatus;
import com.pegasus.backend.shared.enums.ShipmentStatus;
import com.pegasus.backend.shared.enums.ShipmentType;
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
    private final OrderRepository orderRepository;
    private final StockService stockService;

    public PageResponse<ShipmentResponse> getAllShipments(String search, ShipmentStatus status, ShipmentType shipmentType,
            Pageable pageable) {
        log.debug("Getting all shipments with search: {}, status: {}, shipmentType: {}", search, status, shipmentType);

        Page<Shipment> page;

        if (search != null && !search.isBlank()) {
            page = shipmentRepository.searchShipments(search.trim(), pageable);
        } else if (status != null) {
            page = shipmentRepository.findByStatus(status, pageable);
        } else if (shipmentType != null) {
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

        // Validar que la orden existe
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada con ID: " + request.getOrderId()));

        // Validar que la orden está en un estado válido para envío
        if (!canShipOrder(order.getStatus())) {
            throw new BadRequestException(
                    "La orden no está en un estado válido para envío. Estado actual: " + order.getStatus());
        }

        ShippingMethod shippingMethod = shippingMethodRepository.findById(request.getShippingMethodId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Método de envío no encontrado con ID: " + request.getShippingMethodId()));

        Shipment shipment = shipmentMapper.toEntity(request);
        shipment.setOrderId(request.getOrderId());
        shipment.setShippingMethod(shippingMethod);
        shipment.setStatus(ShipmentStatus.PENDING);

        Shipment saved = shipmentRepository.save(shipment);

        log.info("Shipment created successfully with tracking number: {}", saved.getTrackingNumber());
        return shipmentMapper.toResponse(saved);
    }

    /**
     * Validar que la orden puede ser enviada
     */
    private boolean canShipOrder(OrderStatus orderStatus) {
        return orderStatus == OrderStatus.PAID ||
               orderStatus == OrderStatus.PROCESSING ||
               orderStatus == OrderStatus.AWAIT_PAYMENT; // Permitir envío si está esperando pago (pago contra entrega)
    }

    @Transactional
    public ShipmentResponse updateShipment(Long id, UpdateShipmentRequest request, Long updatedByUserId) {
        log.info("Updating shipment with id: {}", id);

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con ID: " + id));

        ShipmentStatus previousStatus = shipment.getStatus();
        
        shipmentMapper.updateEntityFromRequest(request, shipment);
        
        // Si el estado cambió a IN_TRANSIT, decrementar stock físico
        if (previousStatus != ShipmentStatus.IN_TRANSIT && 
            shipment.getStatus() == ShipmentStatus.IN_TRANSIT &&
            shipment.getShipmentType() == ShipmentType.OUTBOUND) {
            
            log.info("Shipment {} is now in transit, decreasing stock for order {}", id, shipment.getOrderId());
            
            // Obtener la orden para decrementar stock de cada item
            Order order = orderRepository.findById(shipment.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada con ID: " + shipment.getOrderId()));
            
            Long defaultWarehouseId = 1L; // TODO: Configurar almacén principal
            
            // Decrementar stock físico para cada item de la orden
            order.getItems().forEach(item -> {
                stockService.decreaseStock(
                        defaultWarehouseId,
                        item.getVariantId(),
                        item.getQuantity(),
                        order.getId(),
                        updatedByUserId
                );
            });
            
            shipment.setShippedAt(java.time.OffsetDateTime.now());
        }
        
        // Si el estado cambió a DELIVERED, marcar fecha de entrega
        if (previousStatus != ShipmentStatus.DELIVERED && 
            shipment.getStatus() == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(java.time.OffsetDateTime.now());
        }
        
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
