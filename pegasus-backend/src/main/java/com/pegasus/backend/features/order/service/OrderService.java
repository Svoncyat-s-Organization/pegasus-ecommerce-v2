package com.pegasus.backend.features.order.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.entity.Variant;
import com.pegasus.backend.features.catalog.repository.VariantRepository;
import com.pegasus.backend.features.customer.entity.Customer;
import com.pegasus.backend.features.customer.repository.CustomerRepository;
import com.pegasus.backend.features.inventory.service.StockService;
import com.pegasus.backend.features.logistic.dto.CreateShipmentRequest;
import com.pegasus.backend.features.logistic.dto.ShipmentResponse;
import com.pegasus.backend.features.logistic.entity.ShippingMethod;
import com.pegasus.backend.features.logistic.repository.ShippingMethodRepository;
import com.pegasus.backend.features.logistic.repository.ShipmentRepository;
import com.pegasus.backend.features.logistic.service.ShipmentService;
import com.pegasus.backend.features.invoice.entity.Payment;
import com.pegasus.backend.features.invoice.entity.PaymentMethod;
import com.pegasus.backend.features.invoice.repository.PaymentRepository;
import com.pegasus.backend.features.invoice.repository.PaymentMethodRepository;
import com.pegasus.backend.features.invoice.repository.InvoiceRepository;
import com.pegasus.backend.features.invoice.mapper.InvoiceMapper;
import com.pegasus.backend.features.invoice.dto.InvoiceSummaryResponse;
import com.pegasus.backend.shared.enums.ShipmentType;
import com.pegasus.backend.features.order.dto.*;
import com.pegasus.backend.features.order.entity.Order;
import com.pegasus.backend.features.order.entity.OrderItem;
import com.pegasus.backend.features.order.entity.OrderStatusHistory;
import com.pegasus.backend.features.order.mapper.OrderMapper;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.features.order.repository.OrderStatusHistoryRepository;
import com.pegasus.backend.features.user.repository.UserRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service para gestión de pedidos
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final CustomerRepository customerRepository;
    private final VariantRepository variantRepository;
    private final StockService stockService;
    private final OrderMapper orderMapper;
    private final ShipmentService shipmentService;
    private final ShippingMethodRepository shippingMethodRepository;
    private final ShipmentRepository shipmentRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceMapper invoiceMapper;
    private final UserRepository userRepository;

    private Long sanitizeStaffUserId(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.existsById(userId) ? userId : null;
    }

    /**
     * Obtener todos los pedidos con filtros opcionales y paginación
     */
    public PageResponse<OrderSummaryResponse> getAllOrders(
            String search,
            OrderStatus status,
            Pageable pageable) {
        log.debug("Getting orders with search: {}, status: {}, page: {}",
                search, status, pageable.getPageNumber());

        Page<Order> page = orderRepository.searchOrders(search, status, pageable);
        List<OrderSummaryResponse> content = orderMapper.toSummaryResponseList(page.getContent());
        List<OrderSummaryResponse> enrichedContent = enrichWithInvoices(content);

        return new PageResponse<>(
                enrichedContent,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Obtener pedidos pagados con comprobante emitido (listos para envío).
     * Nota: la creación de envíos requiere comprobante, por eso este endpoint
     * filtra.
     */
    public PageResponse<OrderSummaryResponse> getPaidOrdersWithInvoice(Pageable pageable) {
        log.debug("Getting PAID orders with invoice, page: {}", pageable.getPageNumber());

        Page<Order> page = orderRepository.findByStatusWithInvoice(OrderStatus.PAID, pageable);
        List<OrderSummaryResponse> content = orderMapper.toSummaryResponseList(page.getContent());
        List<OrderSummaryResponse> enrichedContent = enrichWithInvoices(content);

        return new PageResponse<>(
                enrichedContent,
                content.size() > 0 ? 0 : 0, // Mock pagination properties if needed or implement properly
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Obtener pedido por ID
     */
    public OrderResponse getOrderById(Long id) {
        log.debug("Getting order by id: {}", id);
        Order order = findOrderById(id);
        OrderResponse response = orderMapper.toResponse(order);
        return enrichWithShippingMethod(response);
    }

    private OrderResponse enrichWithShippingMethod(OrderResponse response) {
        // Find associated invoice
        InvoiceSummaryResponse invoice = invoiceRepository.findByOrderId(response.id())
                .stream()
                .findFirst()
                .map(invoiceMapper::toSummaryResponse)
                .orElse(null);

        // Buscar si existe un envío asociado (tomamos el primero que sea OUTBOUND)
        return shipmentRepository.findByOrderId(response.id(), Pageable.unpaged())
                .stream()
                .filter(s -> s.getShipmentType() == ShipmentType.OUTBOUND)
                .findFirst()
                .map(s -> new OrderResponse(
                        response.id(),
                        response.orderNumber(),
                        response.customerId(),
                        response.customerName(),
                        response.customerEmail(),
                        response.status(),
                        response.total(),
                        response.shippingAddress(),
                        response.billingAddress(),
                        response.items(),
                        response.statusHistories(),
                        s.getShippingMethod().getId(),
                        response.createdAt(),
                        response.updatedAt(),
                        invoice))
                .orElse(new OrderResponse(
                        response.id(),
                        response.orderNumber(),
                        response.customerId(),
                        response.customerName(),
                        response.customerEmail(),
                        response.status(),
                        response.total(),
                        response.shippingAddress(),
                        response.billingAddress(),
                        response.items(),
                        response.statusHistories(),
                        null,
                        response.createdAt(),
                        response.updatedAt(),
                        invoice));
    }

    /**
     * Obtener pedido por número de orden
     */
    public OrderResponse getOrderByNumber(String orderNumber) {
        log.debug("Getting order by number: {}", orderNumber);
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pedido no encontrado con número: " + orderNumber));
        return orderMapper.toResponse(order);
    }

    /**
     * Obtener pedidos de un cliente
     */
    public PageResponse<OrderSummaryResponse> getOrdersByCustomer(Long customerId, Pageable pageable) {
        log.debug("Getting orders for customer: {}", customerId);

        // Verificar que el cliente existe
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Cliente no encontrado con ID: " + customerId);
        }

        Page<Order> page = orderRepository.findByCustomerId(customerId, pageable);
        List<OrderSummaryResponse> content = orderMapper.toSummaryResponseList(page.getContent());
        List<OrderSummaryResponse> enrichedContent = enrichWithInvoices(content);

        return new PageResponse<>(
                enrichedContent,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Crear un nuevo pedido
     */
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Long createdByUserId) {
        log.debug("Creating order for customer: {}", request.customerId());

        Long sanitizedUserId = sanitizeStaffUserId(createdByUserId);

        // Validar que el cliente existe y está activo
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cliente no encontrado con ID: " + request.customerId()));

        if (!customer.getIsActive()) {
            throw new BadRequestException("El cliente no está activo");
        }

        // Validar Método de Envío
        ShippingMethod shippingMethod = null;
        if (request.shippingMethodId() != null) {
            shippingMethod = shippingMethodRepository.findById(request.shippingMethodId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Método de envío no encontrado con ID: "
                                    + request.shippingMethodId()));

            if (!Boolean.TRUE.equals(shippingMethod.getIsActive())) {
                throw new BadRequestException("El método de envío seleccionado no está activo");
            }
        }

        // Validar y preparar items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        Long defaultWarehouseId = 1L; // TODO: Configurar almacén principal

        for (OrderItemRequest itemRequest : request.items()) {
            Variant variant = variantRepository.findById(itemRequest.variantId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Variante no encontrada con ID: " + itemRequest.variantId()));

            if (!variant.getIsActive()) {
                throw new BadRequestException(
                        "La variante con SKU " + variant.getSku() + " no está activa");
            }

            // Verificar disponibilidad de stock
            var availability = stockService.checkStockAvailability(
                    defaultWarehouseId,
                    variant.getId(),
                    itemRequest.quantity());

            if (!availability.isAvailable()) {
                throw new BadRequestException(
                        "Stock insuficiente para " + variant.getSku() + ". "
                                + availability.message());
            }

            // Calcular totales
            BigDecimal itemTotal = variant.getPrice().multiply(new BigDecimal(itemRequest.quantity()));
            totalAmount = totalAmount.add(itemTotal);

            // Crear item (desnormalizando datos)
            OrderItem orderItem = OrderItem.builder()
                    .variantId(variant.getId())
                    .productId(variant.getProductId())
                    .sku(variant.getSku())
                    .productName(variant.getProduct().getName())
                    .quantity(itemRequest.quantity())
                    .unitPrice(variant.getPrice())
                    .total(itemTotal)
                    .build();

            orderItems.add(orderItem);
        }

        // Sumar costo de envío al total
        if (shippingMethod != null) {
            totalAmount = totalAmount.add(shippingMethod.getBaseCost());
        }

        // Generar número de orden único
        String orderNumber = generateOrderNumber();

        // Crear orden
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customerId(customer.getId())
                .status(OrderStatus.PENDING)
                .total(totalAmount)
                .shippingAddress(convertAddressDTOToMap(request.shippingAddress()))
                .billingAddress(request.billingAddress() != null
                        ? convertAddressDTOToMap(request.billingAddress())
                        : new HashMap<>())
                .build();

        // Agregar items a la orden
        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        // Guardar orden
        Order savedOrder = orderRepository.save(order);

        // Reservar stock para cada item
        for (OrderItem item : savedOrder.getItems()) {
            stockService.reserveStock(
                    defaultWarehouseId,
                    item.getVariantId(),
                    item.getQuantity(),
                    savedOrder.getId(),
                    sanitizedUserId);
        }

        // Crear historial inicial
        OrderStatusHistory initialHistory = OrderStatusHistory.builder()
                .orderId(savedOrder.getId())
                .status(OrderStatus.PENDING)
                .comments("Pedido creado - Stock reservado")
                .createdBy(sanitizedUserId)
                .build();

        orderStatusHistoryRepository.save(initialHistory);

        // Crear envío inicial automáticamente si se seleccionó método
        if (shippingMethod != null) {
            try {
                CreateShipmentRequest shipmentReq = new CreateShipmentRequest();
                shipmentReq.setShipmentType(ShipmentType.OUTBOUND);
                shipmentReq.setOrderId(savedOrder.getId());
                shipmentReq.setShippingMethodId(shippingMethod.getId());
                shipmentReq.setTrackingNumber("PENDING");
                shipmentReq.setShippingCost(shippingMethod.getBaseCost());
                shipmentReq.setWeightKg(BigDecimal.ONE); // Default weight
                shipmentReq.setEstimatedDeliveryDate(
                        OffsetDateTime.now().plusDays(shippingMethod.getEstimatedDaysMax()));
                shipmentReq.setShippingAddress(savedOrder.getShippingAddress());
                shipmentReq.setRecipientName(
                        extractRecipientNameFromAddress(savedOrder.getShippingAddress()));
                shipmentReq.setRecipientPhone(
                        extractRecipientPhoneFromAddress(savedOrder.getShippingAddress()));
                shipmentReq.setNotes("Envío creado automáticamente desde storefront");

                shipmentService.createShipment(shipmentReq);
                log.info("Auto-created shipment for order {}", savedOrder.getOrderNumber());
            } catch (Exception e) {
                log.error("Failed to auto-create shipment for order {}", savedOrder.getOrderNumber(),
                        e);
            }
        }

        // Create initial payment if provided
        if (request.paymentMethod() != null && !request.paymentMethod().isEmpty()) {
            String methodName = switch (request.paymentMethod()) {
                case "card" -> "Credit Card";
                case "yape" -> "Yape";
                case "plin" -> "Plin";
                default -> request.paymentMethod();
            };

            PaymentMethod pm = paymentMethodRepository.findByName(methodName)
                    .orElseGet(() -> {
                        PaymentMethod newPm = new PaymentMethod();
                        newPm.setName(methodName);
                        return paymentMethodRepository.save(newPm);
                    });

            Payment payment = Payment.builder()
                    .orderId(savedOrder.getId())
                    .paymentMethodId(pm.getId())
                    .amount(savedOrder.getTotal())
                    .transactionId(request.paymentTransactionId())
                    .paymentDate(OffsetDateTime.now())
                    .notes("Pago registrado al crear pedido")
                    .build();

            paymentRepository.save(payment);

            // Update status to PAID if transaction ID is present
            if (request.paymentTransactionId() != null && !request.paymentTransactionId().isEmpty()) {
                savedOrder.setStatus(OrderStatus.PAID);
                orderRepository.save(savedOrder);

                OrderStatusHistory paymentHistory = OrderStatusHistory.builder()
                        .orderId(savedOrder.getId())
                        .status(OrderStatus.PAID)
                        .comments("Pago confirmado: " + request.paymentTransactionId())
                        .createdBy(sanitizedUserId)
                        .build();
                orderStatusHistoryRepository.save(paymentHistory);
            }
        }

        log.info("Order created successfully: {} - Stock reserved", orderNumber);
        return orderMapper.toResponse(savedOrder);
    }

    /**
     * Actualizar estado de un pedido
     */
    @Transactional
    public OrderResponse updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request,
            Long updatedByUserId) {
        log.debug("Updating order {} status to {}", orderId, request.newStatus());

        Long sanitizedUserId = sanitizeStaffUserId(updatedByUserId);

        Order order = findOrderById(orderId);

        // Validar transición de estado
        validateStatusTransition(order.getStatus(), request.newStatus());

        // Actualizar estado
        order.setStatus(request.newStatus());
        Order updatedOrder = orderRepository.save(order);

        // Crear registro en historial
        OrderStatusHistory history = OrderStatusHistory.builder()
                .orderId(order.getId())
                .status(request.newStatus())
                .comments(request.comments())
                .createdBy(sanitizedUserId)
                .build();

        orderStatusHistoryRepository.save(history);

        log.info("Order {} status updated to {}", orderId, request.newStatus());
        return orderMapper.toResponse(updatedOrder);
    }

    /**
     * Método helper para actualizar estado directamente (usado por otros servicios)
     * Actualiza el estado sin userId (sistema automático)
     */
    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus newStatus, String comments) {
        log.debug("Auto-updating order {} status to {} - {}", orderId, newStatus, comments);

        Order order = findOrderById(orderId);

        // Validar transición de estado
        validateStatusTransition(order.getStatus(), newStatus);

        // Actualizar estado
        order.setStatus(newStatus);
        orderRepository.save(order);

        // Crear registro en historial automático (sin userId)
        OrderStatusHistory history = OrderStatusHistory.builder()
                .orderId(order.getId())
                .status(newStatus)
                .comments(comments)
                .createdBy(null) // Sistema automático
                .build();

        orderStatusHistoryRepository.save(history);

        log.info("Order {} status auto-updated to {}", orderId, newStatus);
    }

    /**
     * Cancelar un pedido
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, String reason, Long cancelledByUserId) {
        log.debug("Cancelling order: {}", orderId);

        Long sanitizedUserId = sanitizeStaffUserId(cancelledByUserId);

        Order order = findOrderById(orderId);

        // Validar que el pedido puede ser cancelado
        if (!canBeCancelled(order.getStatus())) {
            throw new BadRequestException(
                    "No se puede cancelar un pedido en estado: " + order.getStatus());
        }

        // Liberar stock reservado
        Long defaultWarehouseId = 1L; // TODO: Configurar almacén principal
        for (OrderItem item : order.getItems()) {
            stockService.releaseReservedStock(
                    defaultWarehouseId,
                    item.getVariantId(),
                    item.getQuantity(),
                    orderId,
                    sanitizedUserId);
        }

        // Actualizar estado
        order.setStatus(OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);

        // Crear registro en historial
        OrderStatusHistory history = OrderStatusHistory.builder()
                .orderId(order.getId())
                .status(OrderStatus.CANCELLED)
                .comments(reason != null ? reason : "Pedido cancelado - Stock liberado")
                .createdBy(sanitizedUserId)
                .build();

        orderStatusHistoryRepository.save(history);

        log.info("Order {} cancelled successfully - Stock released", orderId);
        return orderMapper.toResponse(cancelledOrder);
    }

    // ========================= Helper Methods =========================

    /**
     * Buscar pedido por ID o lanzar excepción
     */
    private Order findOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pedido no encontrado con ID: " + id));
    }

    /**
     * Generar número de orden único
     * Formato: ORD-YYYYMMDD-XXXXX
     */
    private String generateOrderNumber() {
        String datePrefix = OffsetDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String baseNumber = "ORD-" + datePrefix + "-";

        // Generar número secuencial (5 dígitos)
        int attempt = 0;
        String orderNumber;
        do {
            int sequence = (int) (Math.random() * 99999) + 1;
            orderNumber = baseNumber + String.format("%05d", sequence);
            attempt++;
        } while (orderRepository.existsByOrderNumber(orderNumber) && attempt < 10);

        if (orderRepository.existsByOrderNumber(orderNumber)) {
            throw new RuntimeException("No se pudo generar un número de orden único");
        }

        return orderNumber;
    }

    /**
     * Convertir AddressDTO a Map para JSONB
     */
    private Map<String, Object> convertAddressDTOToMap(AddressDTO address) {
        Map<String, Object> map = new HashMap<>();
        map.put("ubigeoId", address.ubigeoId());
        map.put("address", address.address());
        map.put("reference", address.reference());
        map.put("recipientName", address.recipientName());
        map.put("recipientPhone", address.recipientPhone());
        return map;
    }

    /**
     * Validar transición de estado
     */
    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        // Definir transiciones permitidas
        Map<OrderStatus, Set<OrderStatus>> allowedTransitions = new HashMap<>();
        allowedTransitions.put(OrderStatus.PENDING,
                Set.of(OrderStatus.AWAIT_PAYMENT, OrderStatus.CANCELLED));
        allowedTransitions.put(OrderStatus.AWAIT_PAYMENT,
                Set.of(OrderStatus.PAID, OrderStatus.CANCELLED));
        allowedTransitions.put(OrderStatus.PAID,
                Set.of(OrderStatus.PROCESSING, OrderStatus.REFUNDED));
        allowedTransitions.put(OrderStatus.PROCESSING,
                Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.PAID)); // Permitir
                                                                                       // volver a PAID
                                                                                       // si se elimina
                                                                                       // el envío
        allowedTransitions.put(OrderStatus.SHIPPED,
                Set.of(OrderStatus.DELIVERED, OrderStatus.PROCESSING)); // Permitir volver a PROCESSING
                                                                        // si hay problemas
        allowedTransitions.put(OrderStatus.DELIVERED,
                Set.of(OrderStatus.REFUNDED));
        allowedTransitions.put(OrderStatus.CANCELLED, Set.of());
        allowedTransitions.put(OrderStatus.REFUNDED, Set.of());

        Set<OrderStatus> allowed = allowedTransitions.get(currentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new BadRequestException(
                    "Transición de estado no permitida: " + currentStatus + " -> " + newStatus);
        }
    }

    /**
     * Crear envío para un pedido
     * Este método permite al backoffice crear envíos manualmente cuando los
     * clientes tienen problemas
     */
    @Transactional
    public ShipmentResponse createShipmentForOrder(Long orderId, CreateShipmentForOrderRequest request) {
        log.info("Creating shipment for order: {}", orderId);

        // Validar que el pedido existe
        Order order = findOrderById(orderId);

        // Validar que el pedido puede ser enviado
        if (!canShipOrder(order.getStatus())) {
            throw new BadRequestException(
                    "El pedido no está en un estado válido para crear envíos. Estado actual: "
                            + order.getStatus());
        }

        // Construir request para ShipmentService usando datos del pedido
        CreateShipmentRequest shipmentRequest = new CreateShipmentRequest();
        shipmentRequest.setShipmentType(request.getShipmentType());
        shipmentRequest.setOrderId(orderId);
        shipmentRequest.setShippingMethodId(request.getShippingMethodId());
        shipmentRequest.setTrackingNumber(request.getTrackingNumber());
        shipmentRequest.setShippingCost(request.getShippingCost());
        shipmentRequest.setWeightKg(request.getWeightKg());
        shipmentRequest.setEstimatedDeliveryDate(request.getEstimatedDeliveryDate());
        shipmentRequest.setShippingAddress(order.getShippingAddress());

        // Usar nombre/teléfono de la request o extraerlo de la dirección del pedido
        String recipientName = request.getRecipientName();
        if (recipientName == null || recipientName.isBlank()) {
            recipientName = extractRecipientNameFromAddress(order.getShippingAddress());
        }
        shipmentRequest.setRecipientName(recipientName);

        String recipientPhone = request.getRecipientPhone();
        if (recipientPhone == null || recipientPhone.isBlank()) {
            recipientPhone = extractRecipientPhoneFromAddress(order.getShippingAddress());
        }
        shipmentRequest.setRecipientPhone(recipientPhone);

        shipmentRequest.setRequireSignature(request.getRequireSignature());
        shipmentRequest.setPackageQuantity(request.getPackageQuantity());
        shipmentRequest.setNotes(request.getNotes());

        // Delegar creación al ShipmentService
        ShipmentResponse shipmentResponse = shipmentService.createShipment(shipmentRequest);

        log.info("Shipment created successfully for order: {} with tracking: {}",
                orderId, shipmentResponse.trackingNumber());

        return shipmentResponse;
    }

    /**
     * Validar si un pedido puede ser enviado
     */
    private boolean canShipOrder(OrderStatus status) {
        return status == OrderStatus.PAID ||
                status == OrderStatus.PROCESSING ||
                status == OrderStatus.AWAIT_PAYMENT; // Permitir envío si está esperando pago (pago
                                                     // contra entrega)
    }

    /**
     * Extraer nombre del destinatario desde la dirección del pedido
     */
    private String extractRecipientNameFromAddress(Map<String, Object> shippingAddress) {
        if (shippingAddress == null) {
            return "Destinatario";
        }
        Object name = shippingAddress.get("recipientName");
        if (name == null) {
            name = shippingAddress.get("fullName");
        }
        return name != null ? name.toString() : "Destinatario";
    }

    /**
     * Extraer teléfono del destinatario desde la dirección del pedido
     */
    private String extractRecipientPhoneFromAddress(Map<String, Object> shippingAddress) {
        if (shippingAddress == null) {
            return "000000000";
        }
        Object phone = shippingAddress.get("phone");
        return phone != null ? phone.toString() : "000000000";
    }

    /**
     * Verificar si un pedido puede ser cancelado
     */
    private boolean canBeCancelled(OrderStatus status) {
        return status == OrderStatus.PENDING ||
                status == OrderStatus.AWAIT_PAYMENT ||
                status == OrderStatus.PROCESSING;
    }

    private List<OrderSummaryResponse> enrichWithInvoices(List<OrderSummaryResponse> orders) {
        if (orders.isEmpty()) {
            return orders;
        }
        List<Long> orderIds = orders.stream().map(OrderSummaryResponse::id).toList();
        Map<Long, InvoiceSummaryResponse> invoiceMap = invoiceRepository.findByOrderIdIn(orderIds)
                .stream()
                .collect(Collectors.toMap(
                        inv -> inv.getOrderId(),
                        invoiceMapper::toSummaryResponse,
                        (existing, replacement) -> existing));

        return orders.stream().map(order -> new OrderSummaryResponse(
                order.id(),
                order.orderNumber(),
                order.customerId(),
                order.customerName(),
                order.customerEmail(),
                order.customerDocType(),
                order.customerDocNumber(),
                order.status(),
                order.total(),
                order.createdAt(),
                order.updatedAt(),
                invoiceMap.get(order.id()))).toList();
    }
}
