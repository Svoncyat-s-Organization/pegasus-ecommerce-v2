package com.pegasus.backend.features.rma.mapper;

import com.pegasus.backend.features.rma.dto.RmaResponse;
import com.pegasus.backend.features.rma.dto.RmaSummaryResponse;
import com.pegasus.backend.features.rma.entity.Rma;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper MapStruct para Rma
 */
@Mapper(componentModel = "spring", uses = {RmaItemMapper.class, RmaStatusHistoryMapper.class})
public interface RmaMapper {

    @Mapping(target = "orderNumber", source = "order.orderNumber")
    @Mapping(target = "customerName", expression = "java(getCustomerFullName(entity))")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "approverName", expression = "java(getApproverFullName(entity))")
    RmaResponse toResponse(Rma entity);

    @Mapping(target = "orderNumber", source = "order.orderNumber")
    @Mapping(target = "customerName", expression = "java(getCustomerFullName(entity))")
    @Mapping(target = "itemsCount", expression = "java(entity.getItems() != null ? entity.getItems().size() : 0)")
    RmaSummaryResponse toSummaryResponse(Rma entity);

    List<RmaResponse> toResponseList(List<Rma> entities);

    List<RmaSummaryResponse> toSummaryResponseList(List<Rma> entities);

    /**
     * Helper method para obtener nombre completo del cliente
     */
    default String getCustomerFullName(Rma rma) {
        if (rma.getCustomer() != null) {
            return rma.getCustomer().getFirstName() + " " + rma.getCustomer().getLastName();
        }
        return null;
    }

    /**
     * Helper method para obtener nombre completo del aprobador
     */
    default String getApproverFullName(Rma rma) {
        if (rma.getApprover() != null) {
            return rma.getApprover().getFirstName() + " " + rma.getApprover().getLastName();
        }
        return null;
    }
}
