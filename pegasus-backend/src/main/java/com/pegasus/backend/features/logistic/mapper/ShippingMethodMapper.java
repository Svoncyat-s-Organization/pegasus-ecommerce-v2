package com.pegasus.backend.features.logistic.mapper;

import com.pegasus.backend.features.logistic.dto.CreateShippingMethodRequest;
import com.pegasus.backend.features.logistic.dto.ShippingMethodResponse;
import com.pegasus.backend.features.logistic.dto.UpdateShippingMethodRequest;
import com.pegasus.backend.features.logistic.entity.ShippingMethod;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ShippingMethodMapper {

    ShippingMethodResponse toResponse(ShippingMethod entity);

    ShippingMethod toEntity(CreateShippingMethodRequest request);

    void updateEntityFromRequest(UpdateShippingMethodRequest request, @MappingTarget ShippingMethod entity);
}
