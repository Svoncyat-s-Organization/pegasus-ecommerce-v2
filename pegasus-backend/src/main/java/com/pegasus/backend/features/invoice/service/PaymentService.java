package com.pegasus.backend.features.invoice.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.invoice.dto.CreatePaymentRequest;
import com.pegasus.backend.features.invoice.dto.PaymentResponse;
import com.pegasus.backend.features.invoice.entity.Payment;
import com.pegasus.backend.features.invoice.mapper.PaymentMapper;
import com.pegasus.backend.features.invoice.repository.PaymentMethodRepository;
import com.pegasus.backend.features.invoice.repository.PaymentRepository;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.shared.dto.PageResponse;
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
                page.isLast()
        );
    }

    public PaymentResponse getById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con ID: " + id));
        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public PaymentResponse create(CreatePaymentRequest request) {
        if (!orderRepository.existsById(request.orderId())) {
            throw new ResourceNotFoundException("Pedido no encontrado con ID: " + request.orderId());
        }
        if (!paymentMethodRepository.existsById(request.paymentMethodId())) {
            throw new ResourceNotFoundException("Método de pago no encontrado con ID: " + request.paymentMethodId());
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
        log.info("Payment created (orderId={}, methodId={}, amount={})", saved.getOrderId(), saved.getPaymentMethodId(), saved.getAmount());
        return paymentMapper.toResponse(saved);
    }
}
