package com.pegasus.backend.features.invoice.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.features.invoice.dto.CreatePaymentRequest;
import com.pegasus.backend.features.invoice.dto.PaymentResponse;
import com.pegasus.backend.features.invoice.entity.Payment;
import com.pegasus.backend.features.invoice.mapper.PaymentMapper;
import com.pegasus.backend.features.invoice.repository.PaymentMethodRepository;
import com.pegasus.backend.features.invoice.repository.PaymentRepository;
import com.pegasus.backend.features.order.dto.UpdateOrderStatusRequest;
import com.pegasus.backend.features.order.entity.Order;
import com.pegasus.backend.features.order.service.OrderService;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final PaymentMapper paymentMapper;

    public PageResponse<PaymentResponse> getAll(String search, Long orderId, Long paymentMethodId, Pageable pageable) {
        Page<Payment> page;
        boolean hasSearch = search != null && !search.isBlank();

        if (orderId != null && paymentMethodId != null) {
            page = paymentRepository.findByOrderIdAndPaymentMethodId(orderId, paymentMethodId, pageable);
        } else if (orderId != null) {
            page = paymentRepository.findByOrderId(orderId, pageable);
        } else if (paymentMethodId != null) {
            page = paymentRepository.findByPaymentMethodId(paymentMethodId, pageable);
        } else if (hasSearch) {
            page = paymentRepository.searchByTransactionId(search.trim(), pageable);
        } else {
            page = paymentRepository.findAll(pageable);
        }

        List<PaymentResponse> content = paymentMapper.toResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    public PaymentResponse getById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con ID: " + id));
        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public PaymentResponse create(CreatePaymentRequest request, Long createdByUserId) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + request.orderId()));

        if (!paymentMethodRepository.existsById(request.paymentMethodId())) {
            throw new ResourceNotFoundException("Método de pago no encontrado con ID: " + request.paymentMethodId());
        }

        if (paymentRepository.existsByOrderId(request.orderId())) {
            throw new BadRequestException("El pedido ya tiene un pago registrado");
        }

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REFUNDED) {
            throw new BadRequestException("No se puede registrar pago para un pedido en estado: " + order.getStatus());
        }

        // The UI locks amount to order.total; enforce it server-side as well.
        if (request.amount() == null || order.getTotal() == null || request.amount().compareTo(order.getTotal()) != 0) {
            throw new BadRequestException("El monto del pago debe ser igual al total del pedido");
        }

        Payment payment = Payment.builder()
                .orderId(request.orderId())
                .paymentMethodId(request.paymentMethodId())
                .amount(request.amount())
                .transactionId(request.transactionId() != null ? request.transactionId().trim() : null)
                .paymentDate(request.paymentDate() != null ? request.paymentDate() : OffsetDateTime.now())
                .notes(request.notes())
                .build();

        Payment saved = paymentRepository.save(payment);

        // Update order status to PAID using allowed transitions.
        if (order.getStatus() == OrderStatus.PENDING) {
            orderService.updateOrderStatus(
                    order.getId(),
                    new UpdateOrderStatusRequest(OrderStatus.AWAIT_PAYMENT, "Pedido confirmado - esperando pago"),
                    createdByUserId);
        }

        if (order.getStatus() == OrderStatus.AWAIT_PAYMENT || order.getStatus() == OrderStatus.PENDING) {
            orderService.updateOrderStatus(
                    order.getId(),
                    new UpdateOrderStatusRequest(OrderStatus.PAID, "Pago registrado"),
                    createdByUserId);
        } else if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException("No se puede marcar como pagado un pedido en estado: " + order.getStatus());
        }

        log.info("Payment created (orderId={}, methodId={}, amount={})", saved.getOrderId(), saved.getPaymentMethodId(),
                saved.getAmount());
        return paymentMapper.toResponse(saved);
    }
}
