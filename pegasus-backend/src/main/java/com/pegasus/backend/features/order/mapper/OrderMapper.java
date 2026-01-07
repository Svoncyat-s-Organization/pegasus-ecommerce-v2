package com.pegasus.backend.features.order.mapper;

import com.pegasus.backend.features.order.dto.OrderResponse;
import com.pegasus.backend.features.order.dto.OrderSummaryResponse;
import com.pegasus.backend.features.order.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper MapStruct para Order
 */
@Mapper(componentModel = "spring", uses = { OrderItemMapper.class, OrderStatusHistoryMapper.class })
public interface OrderMapper {

    @Mapping(target = "customerName", expression = "java(getCustomerFullName(entity))")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "shippingMethodId", ignore = true)
    OrderResponse toResponse(Order entity);

    @Mapping(target = "customerName", expression = "java(getCustomerFullName(entity))")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "customerDocType", source = "customer.docType")
    @Mapping(target = "customerDocNumber", source = "customer.docNumber")
    @Mapping(target = "invoice", ignore = true)
    OrderSummaryResponse toSummaryResponse(Order entity);

    List<OrderResponse> toResponseList(List<Order> entities);

    List<OrderSummaryResponse> toSummaryResponseList(List<Order> entities);

    /**
     * Helper method para obtener nombre completo del cliente
     */
    default String getCustomerFullName(Order order) {
        if (order.getCustomer() != null) {
            return order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName();
        }
        return null;
    }
}
