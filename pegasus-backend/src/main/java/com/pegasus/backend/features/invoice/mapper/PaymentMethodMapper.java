package com.pegasus.backend.features.invoice.mapper;

import com.pegasus.backend.features.invoice.dto.CreatePaymentMethodRequest;
import com.pegasus.backend.features.invoice.dto.PaymentMethodResponse;
import com.pegasus.backend.features.invoice.dto.UpdatePaymentMethodRequest;
import com.pegasus.backend.features.invoice.entity.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PaymentMethodMapper {

    public PaymentMethodResponse toResponse(PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            return null;
        }

        return new PaymentMethodResponse(
                paymentMethod.getId(),
                paymentMethod.getName(),
                paymentMethod.getIsActive(),
                paymentMethod.getCreatedAt(),
                paymentMethod.getUpdatedAt()
        );
    }

    public List<PaymentMethodResponse> toResponseList(List<PaymentMethod> paymentMethods) {
        if (paymentMethods == null) {
            return List.of();
        }
        return paymentMethods.stream().map(this::toResponse).toList();
    }

    public PaymentMethod toEntity(CreatePaymentMethodRequest request) {
        if (request == null) {
            return null;
        }

        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setName(request.name());
        paymentMethod.setIsActive(true);
        return paymentMethod;
    }

    public void updateEntityFromDto(UpdatePaymentMethodRequest request, PaymentMethod paymentMethod) {
        if (request == null || paymentMethod == null) {
            return;
        }

        if (request.name() != null) {
            paymentMethod.setName(request.name());
        }
    }
}
