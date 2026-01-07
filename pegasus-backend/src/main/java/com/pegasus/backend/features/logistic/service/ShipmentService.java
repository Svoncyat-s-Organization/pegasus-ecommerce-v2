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
import com.pegasus.backend.features.invoice.repository.InvoiceRepository;
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
        private final InvoiceRepository invoiceRepository;

        // Constructor manual para inyectar OrderService con @Lazy
        public ShipmentService(
                        ShipmentRepository shipmentRepository,
                        ShipmentMapper shipmentMapper,
                        ShippingMethodRepository shippingMethodRepository,
                        OrderRepository orderRepository,
                        @Lazy OrderService orderService,
                        StockService stockService,
                        InvoiceRepository invoiceRepository) {
                this.shipmentRepository = shipmentRepository;
                this.shipmentMapper = shipmentMapper;
                this.shippingMethodRepository = shippingMethodRepository;
                this.orderRepository = orderRepository;
                this.orderService = orderService;
                this.stockService = stockService;
                this.invoiceRepository = invoiceRepository;
        }

        public PageResponse<ShipmentResponse> getAllShipments(String search, ShipmentStatus status,
                        ShipmentType shipmentType,
                        Pageable pageable) {
                log.debug("Getting all shipments with search: {}, status: {}, shipmentType: {}", search, status,
                                shipmentType);

                Page<Shipment> page;

                if (search != null && !search.isBlank()) {
                        page = shipmentRepository.searchShipments(search.trim(), pageable);
                } else if (status != null) {
                        page = shipmentRepository.findByStatus(status, pageable);
                } else if (shipmentType != null) {
                        page = shipmentRepository.findByShipmentType(shipmentType, pageable);
                } else {
                        page = shipmentRepository.findAllActive(pageable);
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
                                                () -> new ResourceNotFoundException(
                                                                "Orden no encontrada con ID: " + request.getOrderId()));

                /*
                 * // Validar que la orden tiene una factura (requisito previo al envío)
                 * if (!invoiceRepository.existsByOrderId(request.getOrderId())) {
                 * throw new BadRequestException(
                 * "No se puede crear un envío para esta orden. Debe emitirse una factura primero."
                 * );
                 * }
                 */

                ShippingMethod shippingMethod = shippingMethodRepository.findById(request.getShippingMethodId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Método de envío no encontrado con ID: "
                                                                + request.getShippingMethodId()));

                Shipment shipment = shipmentMapper.toEntity(request);
                shipment.setOrderId(request.getOrderId());
                shipment.setShippingMethod(shippingMethod);
                shipment.setStatus(ShipmentStatus.PENDING); // Inicia como PENDIENTE
                // NO se marca shippedAt aquí, se marcará cuando se confirme el envío

                Shipment saved = shipmentRepository.save(shipment);

                // AUTOMÁTICO: Solo para envíos SALIENTES (pedido). Para envíos ENTRANTES
                // (devolución/RMA)
                // no se debe afectar el estado del pedido.
                if (request.getShipmentType() == ShipmentType.OUTBOUND) {
                        // Solo pasar a PROCESSING si el pedido ya está PAGADO (PAID)
                        // Si está PENDING, se queda en PENDING hasta que se pague.
                        if (order.getStatus() == OrderStatus.PAID) {
                                log.info("Auto-updating order {} status to PROCESSING after OUTBOUND shipment creation",
                                                request.getOrderId());
                                orderService.updateOrderStatus(
                                                request.getOrderId(),
                                                OrderStatus.PROCESSING,
                                                "Envío creado - preparando pedido para despacho");
                        }
                }

                log.info("Shipment created successfully with tracking number: {} - Order status: {}",
                                saved.getTrackingNumber(),
                                order.getStatus() == OrderStatus.PAID ? "PROCESSING" : order.getStatus());
                return shipmentMapper.toResponse(saved);
        }

        /**
         * Marcar envío como enviado (transición de PENDING a IN_TRANSIT)
         * Esto dispara el decremento de stock y actualiza el pedido a SHIPPED
         */
        @Transactional
        public ShipmentResponse markAsShipped(Long id) {
                log.info("Marking shipment {} as shipped", id);

                Shipment shipment = shipmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con ID: " + id));

                // Solo envíos SALIENTES deben impactar stock/estado del pedido.
                if (shipment.getShipmentType() != ShipmentType.OUTBOUND) {
                        throw new BadRequestException(
                                        "Solo los envíos SALIENTES (pedido) pueden marcarse como enviados. Tipo actual: "
                                                        + shipment.getShipmentType());
                }

                // Validar que el envío está en estado PENDING
                if (shipment.getStatus() != ShipmentStatus.PENDING) {
                        throw new BadRequestException(
                                        "Solo se pueden marcar como enviados los envíos en estado PENDIENTE. Estado actual: "
                                                        + shipment.getStatus());
                }

                // Cambiar estado a IN_TRANSIT
                shipment.setStatus(ShipmentStatus.IN_TRANSIT);
                shipment.setShippedAt(java.time.OffsetDateTime.now());

                // Obtener la orden para decrementar stock de cada item
                Order order = orderRepository.findById(shipment.getOrderId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Orden no encontrada con ID: " + shipment.getOrderId()));

                Long defaultWarehouseId = 1L; // TODO: Configurar almacén principal desde settings

                // AUTOMÁTICO: Decrementar stock físico para cada item de la orden
                order.getItems().forEach(item -> {
                        log.info("Decreasing stock for variant {} by {} units", item.getVariantId(),
                                        item.getQuantity());
                        stockService.decreaseStock(
                                        defaultWarehouseId,
                                        item.getVariantId(),
                                        item.getQuantity(),
                                        order.getId(),
                                        null // Sistema automático
                        );
                });

                // AUTOMÁTICO: Actualizar estado del pedido a SHIPPED
                log.info("Auto-updating order {} status to SHIPPED", shipment.getOrderId());
                orderService.updateOrderStatus(
                                shipment.getOrderId(),
                                OrderStatus.SHIPPED,
                                "Envío despachado - pedido en tránsito al cliente");

                Shipment updated = shipmentRepository.save(shipment);

                log.info("Shipment {} marked as shipped successfully - Order status: SHIPPED and stock decremented",
                                updated.getTrackingNumber());
                return shipmentMapper.toResponse(updated);
        }

        /**
         * Validar que la orden puede ser enviada
         */
        private boolean canShipOrder(OrderStatus orderStatus) {
                return orderStatus == OrderStatus.PAID ||
                                orderStatus == OrderStatus.PROCESSING ||
                                orderStatus == OrderStatus.AWAIT_PAYMENT; // Permitir envío si está esperando pago (pago
                                                                          // contra entrega)
        }

        @Transactional
        public ShipmentResponse updateShipment(Long id, UpdateShipmentRequest request, Long updatedByUserId) {
                log.info("Updating shipment with id: {}", id);

                Shipment shipment = shipmentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado con ID: " + id));

                ShipmentStatus previousStatus = shipment.getStatus();

                shipmentMapper.updateEntityFromRequest(request, shipment);

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

                // Si el envío fue enviado (IN_TRANSIT), restaurar el stock
                if (shipment.getStatus() == ShipmentStatus.IN_TRANSIT) {
                        log.info("Restoring stock for cancelled shipment {}", id);
                        Order order = orderRepository.findById(shipment.getOrderId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Orden no encontrada con ID: " + shipment.getOrderId()));

                        Long defaultWarehouseId = 1L;
                        order.getItems().forEach(item -> {
                                log.info("Restoring stock for variant {} by {} units", item.getVariantId(),
                                                item.getQuantity());
                                stockService.increaseStock(
                                                defaultWarehouseId,
                                                item.getVariantId(),
                                                item.getQuantity(),
                                                item.getUnitPrice(), // unitCost
                                                null, // purchaseId (no es una compra)
                                                null); // userId (sistema automático)
                        });
                }

                // Devolver el pedido a estado PAID
                log.info("Returning order {} to PAID status after shipment deletion", shipment.getOrderId());
                orderService.updateOrderStatus(
                                shipment.getOrderId(),
                                OrderStatus.PAID,
                                "Envío eliminado - pedido devuelto a estado PAGADO");

                shipment.setIsActive(false);
                shipmentRepository.save(shipment);

                log.info("Shipment deleted successfully: {}", shipment.getTrackingNumber());
        }
}
