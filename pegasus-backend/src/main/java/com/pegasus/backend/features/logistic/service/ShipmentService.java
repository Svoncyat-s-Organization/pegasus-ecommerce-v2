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
import com.pegasus.backend.features.order.service.OrderService;
import com.pegasus.backend.features.inventory.service.StockService;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.OrderStatus;
import com.pegasus.backend.shared.enums.ShipmentStatus;
import com.pegasus.backend.shared.enums.ShipmentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@Transactional(readOnly = true)
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentMapper shipmentMapper;
    private final ShippingMethodRepository shippingMethodRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final StockService stockService;

    // Constructor manual para inyectar OrderService con @Lazy
    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentMapper shipmentMapper,
            ShippingMethodRepository shippingMethodRepository,
            OrderRepository orderRepository,
            @Lazy OrderService orderService,
            StockService stockService) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentMapper = shipmentMapper;
        this.shippingMethodRepository = shippingMethodRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.stockService = stockService;
    }

    public PageResponse<ShipmentResponse> getAllShipments(String search, ShipmentStatus status,
            ShipmentType shipmentType,
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
                .orElseThrow(
                        () -> new ResourceNotFoundException("Orden no encontrada con ID: " + request.getOrderId()));

        // Validar que la orden está en un estado válido para envío (debe estar PAGADA)
        if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException(
                    "La orden debe estar PAGADA para crear un envío. Estado actual: " + order.getStatus());
        }

        ShippingMethod shippingMethod = shippingMethodRepository.findById(request.getShippingMethodId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Método de envío no encontrado con ID: " + request.getShippingMethodId()));

        Shipment shipment = shipmentMapper.toEntity(request);
        shipment.setOrderId(request.getOrderId());
        shipment.setShippingMethod(shippingMethod);
        shipment.setStatus(ShipmentStatus.IN_TRANSIT); // DIRECTO A EN_TRÁNSITO
        shipment.setShippedAt(java.time.OffsetDateTime.now()); // Marcar como enviado ahora

        Shipment saved = shipmentRepository.save(shipment);

        // AUTOMÁTICO PASO 1: Actualizar estado del pedido a PROCESSING (preparando
        // envío)
        log.info("Auto-updating order {} status to PROCESSING after shipment creation", request.getOrderId());
        orderService.updateOrderStatus(
                request.getOrderId(),
                OrderStatus.PROCESSING,
                "Envío creado - preparando pedido para despacho");

        // AUTOMÁTICO PASO 2: Actualizar estado del pedido a SHIPPED (enviado)
        log.info("Auto-updating order {} status to SHIPPED after shipment creation", request.getOrderId());
        orderService.updateOrderStatus(
                request.getOrderId(),
                OrderStatus.SHIPPED,
                "Envío despachado - pedido en tránsito al cliente");

        // AUTOMÁTICO: Decrementar stock de cada item del pedido
        Long defaultWarehouseId = 1L; // TODO: Configurar almacén principal desde settings
        order.getItems().forEach(item -> {
            log.info("Decreasing stock for variant {} by {} units", item.getVariantId(), item.getQuantity());
            stockService.decreaseStock(
                    defaultWarehouseId,
                    item.getVariantId(),
                    item.getQuantity(),
                    order.getId(),
                    null // Sistema automático
            );
        });

        log.info("Shipment created successfully with tracking number: {} - Order shipped and stock decremented",
                saved.getTrackingNumber());
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

        // AUTOMÁTICO: Si el estado cambió a IN_TRANSIT (enviado), decrementar stock y
        // actualizar orden a SHIPPED
        if (previousStatus != ShipmentStatus.IN_TRANSIT &&
                shipment.getStatus() == ShipmentStatus.IN_TRANSIT &&
                shipment.getShipmentType() == ShipmentType.OUTBOUND) {

            log.info("Shipment {} is now in transit, decreasing stock and updating order status to SHIPPED", id);

            // Obtener la orden para decrementar stock de cada item
            Order order = orderRepository.findById(shipment.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Orden no encontrada con ID: " + shipment.getOrderId()));

            Long defaultWarehouseId = 1L; // TODO: Configurar almacén principal desde settings

            // AUTOMÁTICO: Decrementar stock físico para cada item de la orden
            order.getItems().forEach(item -> {
                log.info("Decreasing stock for variant {} by {} units", item.getVariantId(), item.getQuantity());
                stockService.decreaseStock(
                        defaultWarehouseId,
                        item.getVariantId(),
                        item.getQuantity(),
                        order.getId(),
                        updatedByUserId);
            });

            // AUTOMÁTICO: Actualizar estado del pedido a SHIPPED (enviado)
            orderService.updateOrderStatus(
                    shipment.getOrderId(),
                    OrderStatus.SHIPPED,
                    "Pedido en tránsito - enviado al cliente");

            shipment.setShippedAt(java.time.OffsetDateTime.now());
        }

        // AUTOMÁTICO: Si el estado cambió a DELIVERED, marcar fecha de entrega y
        // actualizar orden a DELIVERED
        if (previousStatus != ShipmentStatus.DELIVERED &&
                shipment.getStatus() == ShipmentStatus.DELIVERED) {

            log.info("Shipment {} delivered, updating order status to DELIVERED", id);

            shipment.setDeliveredAt(java.time.OffsetDateTime.now());

            // AUTOMÁTICO: Actualizar estado del pedido a DELIVERED (entregado)
            orderService.updateOrderStatus(
                    shipment.getOrderId(),
                    OrderStatus.DELIVERED,
                    "Pedido entregado exitosamente al cliente");
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
