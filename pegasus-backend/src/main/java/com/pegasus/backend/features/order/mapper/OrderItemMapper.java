package com.pegasus.backend.features.order.mapper;

import com.pegasus.backend.features.order.dto.OrderItemResponse;
import com.pegasus.backend.features.order.entity.OrderItem;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Mapper MapStruct para OrderItem
 */
@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    OrderItemResponse toResponse(OrderItem entity);

    List<OrderItemResponse> toResponseList(List<OrderItem> entities);
}
