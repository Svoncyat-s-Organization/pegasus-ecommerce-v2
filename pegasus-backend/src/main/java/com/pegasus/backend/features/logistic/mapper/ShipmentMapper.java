package com.pegasus.backend.features.logistic.mapper;

import com.pegasus.backend.features.logistic.dto.CreateShipmentRequest;
import com.pegasus.backend.features.logistic.dto.ShipmentResponse;
import com.pegasus.backend.features.logistic.dto.UpdateShipmentRequest;
import com.pegasus.backend.features.logistic.entity.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ShipmentMapper {

    @Mapping(source = "orderId", target = "orderId")
    @Mapping(source = "shippingMethod.id", target = "shippingMethodId")
    @Mapping(source = "shippingMethod.name", target = "shippingMethodName")
    ShipmentResponse toResponse(Shipment entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "shippingMethod", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "shippedAt", ignore = true)
    @Mapping(target = "deliveredAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Shipment toEntity(CreateShipmentRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "shipmentType", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "rmaId", ignore = true)
    @Mapping(target = "shippingMethod", ignore = true)
    @Mapping(target = "trackingNumber", ignore = true)
    @Mapping(target = "shippingCost", ignore = true)
    @Mapping(target = "weightKg", ignore = true)
    @Mapping(target = "estimatedDeliveryDate", ignore = true)
    @Mapping(target = "shippingAddress", ignore = true)
    @Mapping(target = "recipientName", ignore = true)
    @Mapping(target = "recipientPhone", ignore = true)
    @Mapping(target = "requireSignature", ignore = true)
    @Mapping(target = "packageQuantity", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(UpdateShipmentRequest request, @MappingTarget Shipment entity);
}
