package com.pegasus.backend.features.invoice.mapper;

import com.pegasus.backend.features.invoice.dto.PaymentResponse;
import com.pegasus.backend.features.invoice.entity.Payment;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        String paymentMethodName = payment.getPaymentMethod() != null
                ? payment.getPaymentMethod().getName()
                : null;

        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getPaymentMethodId(),
                paymentMethodName,
                payment.getAmount(),
                payment.getTransactionId(),
                payment.getPaymentDate(),
                payment.getNotes(),
                payment.getIsActive(),
                payment.getCreatedAt(),
                payment.getUpdatedAt());
    }

    public List<PaymentResponse> toResponseList(List<Payment> payments) {
        if (payments == null) {
            return List.of();
        }
        return payments.stream().map(this::toResponse).toList();
    }
}
