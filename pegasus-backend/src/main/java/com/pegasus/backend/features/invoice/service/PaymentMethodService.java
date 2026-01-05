package com.pegasus.backend.features.invoice.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.invoice.dto.CreatePaymentMethodRequest;
import com.pegasus.backend.features.invoice.dto.PaymentMethodResponse;
import com.pegasus.backend.features.invoice.dto.UpdatePaymentMethodRequest;
import com.pegasus.backend.features.invoice.entity.PaymentMethod;
import com.pegasus.backend.features.invoice.mapper.PaymentMethodMapper;
import com.pegasus.backend.features.invoice.repository.PaymentMethodRepository;
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
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentMethodMapper paymentMethodMapper;

    public PageResponse<PaymentMethodResponse> getAll(String search, Pageable pageable) {
        Page<PaymentMethod> page = (search != null && !search.isBlank())
                ? paymentMethodRepository.search(search.trim(), pageable)
                : paymentMethodRepository.findAll(pageable);

        List<PaymentMethodResponse> content = paymentMethodMapper.toResponseList(page.getContent());

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

    public PaymentMethodResponse getById(Long id) {
        PaymentMethod paymentMethod = findById(id);
        return paymentMethodMapper.toResponse(paymentMethod);
    }

    @Transactional
    public PaymentMethodResponse create(CreatePaymentMethodRequest request) {
        String normalizedName = request.name().trim();
        if (paymentMethodRepository.existsByName(normalizedName)) {
            throw new IllegalArgumentException("Ya existe un método de pago con ese nombre");
        }

        PaymentMethod paymentMethod = paymentMethodMapper.toEntity(new CreatePaymentMethodRequest(normalizedName));
        PaymentMethod saved = paymentMethodRepository.save(paymentMethod);
        log.info("Payment method created: {}", saved.getName());
        return paymentMethodMapper.toResponse(saved);
    }

    @Transactional
    public PaymentMethodResponse update(Long id, UpdatePaymentMethodRequest request) {
        PaymentMethod paymentMethod = findById(id);
        String normalizedName = request.name().trim();

        if (!normalizedName.equals(paymentMethod.getName()) && paymentMethodRepository.existsByName(normalizedName)) {
            throw new IllegalArgumentException("Ya existe un método de pago con ese nombre");
        }

        paymentMethodMapper.updateEntityFromDto(new UpdatePaymentMethodRequest(normalizedName), paymentMethod);
        PaymentMethod updated = paymentMethodRepository.save(paymentMethod);
        return paymentMethodMapper.toResponse(updated);
    }

    @Transactional
    public PaymentMethodResponse toggleStatus(Long id) {
        PaymentMethod paymentMethod = findById(id);
        paymentMethod.setIsActive(!paymentMethod.getIsActive());
        PaymentMethod updated = paymentMethodRepository.save(paymentMethod);
        return paymentMethodMapper.toResponse(updated);
    }

    private PaymentMethod findById(Long id) {
        return paymentMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
    }
}
