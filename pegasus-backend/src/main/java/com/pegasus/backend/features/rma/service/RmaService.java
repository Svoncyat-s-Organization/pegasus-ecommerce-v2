package com.pegasus.backend.features.rma.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.customer.repository.CustomerRepository;
import com.pegasus.backend.features.order.entity.Order;
import com.pegasus.backend.features.order.entity.OrderItem;
import com.pegasus.backend.features.order.repository.OrderItemRepository;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.features.rma.dto.*;
import com.pegasus.backend.features.rma.entity.Rma;
import com.pegasus.backend.features.rma.entity.RmaItem;
import com.pegasus.backend.features.rma.entity.RmaStatusHistory;
import com.pegasus.backend.features.rma.mapper.RmaMapper;
import com.pegasus.backend.features.rma.repository.RmaItemRepository;
import com.pegasus.backend.features.rma.repository.RmaRepository;
import com.pegasus.backend.features.rma.repository.RmaStatusHistoryRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.OrderStatus;
import com.pegasus.backend.shared.enums.RmaStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service principal para gestión de RMAs (devoluciones)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RmaService {

    private final RmaRepository rmaRepository;
    private final RmaItemRepository rmaItemRepository;
    private final RmaStatusHistoryRepository rmaStatusHistoryRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final RmaMapper rmaMapper;

    /**
     * Obtener todos los RMAs con filtros opcionales y paginación
     */
    public PageResponse<RmaSummaryResponse> getAllRmas(
            String search,
            RmaStatus status,
            Long customerId,
            Pageable pageable) {
        log.debug("Getting RMAs with search: {}, status: {}, customerId: {}, page: {}",
                search, status, customerId, pageable.getPageNumber());

        Page<Rma> page = rmaRepository.searchRmas(search, status, customerId, pageable);
        List<RmaSummaryResponse> content = rmaMapper.toSummaryResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Obtener RMA por ID
     */
    public RmaResponse getRmaById(Long id) {
        log.debug("Getting RMA by id: {}", id);
        Rma rma = findRmaById(id);
        return rmaMapper.toResponse(rma);
    }

    /**
     * Obtener RMA por número
     */
    public RmaResponse getRmaByNumber(String rmaNumber) {
        log.debug("Getting RMA by number: {}", rmaNumber);
        Rma rma = rmaRepository.findByRmaNumber(rmaNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RMA no encontrado con número: " + rmaNumber));
        return rmaMapper.toResponse(rma);
    }

    /**
     * Obtener RMAs de un cliente
     */
    public PageResponse<RmaSummaryResponse> getRmasByCustomer(Long customerId, Pageable pageable) {
        log.debug("Getting RMAs for customer: {}", customerId);

        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Cliente no encontrado con ID: " + customerId);
        }

        Page<Rma> page = rmaRepository.findByCustomerId(customerId, pageable);
        List<RmaSummaryResponse> content = rmaMapper.toSummaryResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Obtener RMAs de una orden
     */
    public PageResponse<RmaSummaryResponse> getRmasByOrder(Long orderId, Pageable pageable) {
        log.debug("Getting RMAs for order: {}", orderId);

        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Orden no encontrada con ID: " + orderId);
        }

        Page<Rma> page = rmaRepository.findByOrderId(orderId, pageable);
        List<RmaSummaryResponse> content = rmaMapper.toSummaryResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Crear nueva solicitud de RMA (desde backoffice)
     */
    @Transactional
    public RmaResponse createRma(CreateRmaRequest request, Long staffUserId) {
        log.info("Creating RMA for order: {} by staff user: {}", request.orderId(), staffUserId);

        // Validar orden (solo órdenes entregadas dentro de ventana)
        Order order = validateOrderForRma(request.orderId());

        // Validar items
        List<RmaItem> rmaItems = validateAndBuildRmaItems(request.items(), order);

        // Calcular monto total de items
        BigDecimal itemsTotal = rmaItems.stream()
                .map(RmaItem::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Crear RMA
        Rma rma = Rma.builder()
                .rmaNumber(generateRmaNumber())
                .orderId(request.orderId())
                .customerId(order.getCustomerId())
                .status(RmaStatus.PENDING)
                .reason(request.reason())
                .customerComments(request.customerComments())
                .refundAmount(itemsTotal)
                .restockingFee(BigDecimal.ZERO)
                .shippingCostRefund(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .statusHistories(new ArrayList<>())
                .build();

        // Agregar items
        rmaItems.forEach(rma::addItem);

        // Guardar RMA
        Rma savedRma = rmaRepository.save(rma);

        // Crear historial inicial
        createStatusHistory(savedRma.getId(), RmaStatus.PENDING,
                "Solicitud de devolución creada por staff", staffUserId);

        log.info("RMA created successfully: {}", savedRma.getRmaNumber());
        return rmaMapper.toResponse(savedRma);
    }

    /**
     * Crear nueva solicitud de RMA (desde storefront por el cliente)
     */
    @Transactional
    public RmaResponse createRmaForCustomer(CreateRmaRequest request, Long customerId) {
        log.info("Creating RMA for order: {} by customer: {}", request.orderId(), customerId);

        // Validar orden
        Order order = validateOrderForRma(request.orderId());

        // Validar que el pedido pertenece al cliente
        if (!order.getCustomerId().equals(customerId)) {
            throw new BadRequestException("No tienes permiso para crear una devolución para este pedido");
        }

        // Validar items
        List<RmaItem> rmaItems = validateAndBuildRmaItems(request.items(), order);

        // Calcular monto total de items
        BigDecimal itemsTotal = rmaItems.stream()
                .map(RmaItem::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Crear RMA
        Rma rma = Rma.builder()
                .rmaNumber(generateRmaNumber())
                .orderId(request.orderId())
                .customerId(order.getCustomerId())
                .status(RmaStatus.PENDING)
                .reason(request.reason())
                .customerComments(request.customerComments())
                .refundAmount(itemsTotal)
                .restockingFee(BigDecimal.ZERO)
                .shippingCostRefund(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .statusHistories(new ArrayList<>())
                .build();

        // Agregar items
        rmaItems.forEach(rma::addItem);

        // Guardar RMA
        Rma savedRma = rmaRepository.save(rma);

        // Crear historial inicial (con customerId como createdBy)
        createStatusHistory(savedRma.getId(), RmaStatus.PENDING,
                "Solicitud de devolución creada por el cliente", customerId);

        log.info("RMA created successfully by customer: {}", savedRma.getRmaNumber());
        return rmaMapper.toResponse(savedRma);
    }

    /**
     * Obtener RMAs de una orden específica del cliente
     * (Para storefront - valida que el cliente sea dueño del pedido)
     */
    public PageResponse<RmaSummaryResponse> getRmasByOrderAndCustomer(
            Long orderId, Long customerId, Pageable pageable) {
        log.debug("Getting RMAs for order: {} and customer: {}", orderId, customerId);

        // Validar que la orden existe y pertenece al cliente
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada con ID: " + orderId));

        if (!order.getCustomerId().equals(customerId)) {
            throw new BadRequestException("No tienes permiso para ver RMAs de este pedido");
        }

        Page<Rma> page = rmaRepository.findByOrderId(orderId, pageable);
        List<RmaSummaryResponse> content = rmaMapper.toSummaryResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Actualizar RMA (solo staff)
     */
    @Transactional
    public RmaResponse updateRma(Long id, UpdateRmaRequest request, Long userId) {
        log.info("Updating RMA: {} by user: {}", id, userId);

        Rma rma = findRmaById(id);

        if (rma.isFinalized()) {
            throw new BadRequestException("No se puede actualizar un RMA finalizado");
        }

        boolean statusChanged = false;

        if (request.status() != null && request.status() != rma.getStatus()) {
            rma.setStatus(request.status());
            statusChanged = true;
        }

        if (request.staffNotes() != null) {
            rma.setStaffNotes(request.staffNotes());
        }

        if (request.refundMethod() != null) {
            rma.setRefundMethod(request.refundMethod());
        }

        Rma updatedRma = rmaRepository.save(rma);

        if (statusChanged) {
            createStatusHistory(rma.getId(), rma.getStatus(),
                    request.staffNotes(), userId);
        }

        log.info("RMA updated successfully: {}", rma.getRmaNumber());
        return rmaMapper.toResponse(updatedRma);
    }

    /**
     * Cancelar RMA (cliente o staff)
     */
    @Transactional
    public RmaResponse cancelRma(Long id, String comments, Long userId) {
        log.info("Cancelling RMA: {} by user: {}", id, userId);

        Rma rma = findRmaById(id);

        if (rma.isFinalized()) {
            throw new BadRequestException("No se puede cancelar un RMA finalizado");
        }

        if (rma.getStatus() != RmaStatus.PENDING && rma.getStatus() != RmaStatus.APPROVED) {
            throw new BadRequestException(
                    "Solo se pueden cancelar RMAs en estado PENDING o APPROVED");
        }

        rma.setStatus(RmaStatus.CANCELLED);
        Rma cancelledRma = rmaRepository.save(rma);

        createStatusHistory(rma.getId(), RmaStatus.CANCELLED, comments, userId);

        log.info("RMA cancelled successfully: {}", rma.getRmaNumber());
        return rmaMapper.toResponse(cancelledRma);
    }

    /**
     * Obtener RMAs pendientes de inspección
     */
    public PageResponse<RmaSummaryResponse> getRmasAwaitingInspection(Pageable pageable) {
        log.debug("Getting RMAs awaiting inspection");
        Page<Rma> page = rmaRepository.findRmasAwaitingInspection(pageable);
        List<RmaSummaryResponse> content = rmaMapper.toSummaryResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    /**
     * Obtener RMAs listos para reembolso
     */
    public PageResponse<RmaSummaryResponse> getRmasReadyForRefund(Pageable pageable) {
        log.debug("Getting RMAs ready for refund");
        Page<Rma> page = rmaRepository.findRmasReadyForRefund(pageable);
        List<RmaSummaryResponse> content = rmaMapper.toSummaryResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    // ==================== HELPER METHODS ====================

    /**
     * Buscar RMA por ID (lanzar excepción si no existe)
     */
    public Rma findRmaById(Long id) {
        return rmaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RMA no encontrado con ID: " + id));
    }

    /**
     * Validar orden para RMA
     */
    private Order validateOrderForRma(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Orden no encontrada con ID: " + orderId));

        // Verificar que la orden está en estado válido para devolución
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException(
                    "Solo se pueden devolver órdenes en estado DELIVERED. Estado actual: "
                            + order.getStatus());
        }

        // Verificar ventana de devolución (30 días)
        OffsetDateTime deliveryDate = order.getUpdatedAt(); // Simplificado, debería ser delivery_date
        OffsetDateTime returnDeadline = deliveryDate.plusDays(30);
        if (OffsetDateTime.now().isAfter(returnDeadline)) {
            throw new BadRequestException(
                    "La ventana de devolución ha expirado. Plazo límite: " + returnDeadline);
        }

        return order;
    }

    /**
     * Validar y construir items de RMA
     */
    private List<RmaItem> validateAndBuildRmaItems(List<RmaItemRequest> itemRequests, Order order) {
        List<RmaItem> rmaItems = new ArrayList<>();

        for (RmaItemRequest itemRequest : itemRequests) {
            // Verificar que el order_item existe y pertenece a la orden
            OrderItem orderItem = orderItemRepository.findById(itemRequest.orderItemId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Item de orden no encontrado con ID: " + itemRequest.orderItemId()));

            if (!orderItem.getOrderId().equals(order.getId())) {
                throw new BadRequestException(
                        "El item " + itemRequest.orderItemId() + " no pertenece a la orden");
            }

            // Verificar cantidad
            if (itemRequest.quantity() > orderItem.getQuantity()) {
                throw new BadRequestException(
                        "Cantidad a devolver (" + itemRequest.quantity() +
                                ") excede la cantidad comprada (" + orderItem.getQuantity() + ")");
            }

            // Verificar que no existe RMA pendiente para este order_item
            if (rmaRepository.existsPendingRmaForOrderItem(itemRequest.orderItemId())) {
                throw new BadRequestException(
                        "Ya existe una devolución pendiente para el item: " + itemRequest.orderItemId());
            }

            // Calcular refund_amount (precio * cantidad)
            BigDecimal refundAmount = orderItem.getUnitPrice()
                    .multiply(new BigDecimal(itemRequest.quantity()));

            RmaItem rmaItem = RmaItem.builder()
                    .orderItemId(itemRequest.orderItemId())
                    .variantId(itemRequest.variantId())
                    .quantity(itemRequest.quantity())
                    .refundAmount(refundAmount)
                    .restockApproved(false)
                    .build();

            rmaItems.add(rmaItem);
        }

        return rmaItems;
    }

    /**
     * Crear registro de historial de estado
     */
    public void createStatusHistory(Long rmaId, RmaStatus status, String comments, Long userId) {
        RmaStatusHistory history = RmaStatusHistory.builder()
                .rmaId(rmaId)
                .status(status)
                .comments(comments)
                .createdBy(userId)
                .build();

        rmaStatusHistoryRepository.save(history);
    }

    /**
     * Generar número único de RMA (formato: RMA-YYYY-NNNNN)
     */
    private String generateRmaNumber() {
        String yearMonth = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = rmaRepository.count() + 1;
        return String.format("RMA-%s-%05d", yearMonth, count);
    }
}
