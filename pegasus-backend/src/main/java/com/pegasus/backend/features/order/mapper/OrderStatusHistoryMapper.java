package com.pegasus.backend.features.order.mapper;

import com.pegasus.backend.features.order.dto.OrderStatusHistoryResponse;
import com.pegasus.backend.features.order.entity.OrderStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper MapStruct para OrderStatusHistory
 */
@Mapper(componentModel = "spring")
public interface OrderStatusHistoryMapper {

    @Mapping(target = "createdByUsername", source = "createdByUser.username")
    OrderStatusHistoryResponse toResponse(OrderStatusHistory entity);

    List<OrderStatusHistoryResponse> toResponseList(List<OrderStatusHistory> entities);
}
