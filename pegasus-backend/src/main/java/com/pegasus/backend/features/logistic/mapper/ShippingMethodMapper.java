package com.pegasus.backend.features.logistic.mapper;

import com.pegasus.backend.features.logistic.dto.CreateShippingMethodRequest;
import com.pegasus.backend.features.logistic.dto.ShippingMethodResponse;
import com.pegasus.backend.features.logistic.dto.UpdateShippingMethodRequest;
import com.pegasus.backend.features.logistic.entity.ShippingMethod;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ShippingMethodMapper {

    ShippingMethodResponse toResponse(ShippingMethod entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ShippingMethod toEntity(CreateShippingMethodRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(UpdateShippingMethodRequest request, @MappingTarget ShippingMethod entity);
}
