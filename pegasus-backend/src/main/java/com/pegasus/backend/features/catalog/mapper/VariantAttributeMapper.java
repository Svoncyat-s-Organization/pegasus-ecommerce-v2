package com.pegasus.backend.features.catalog.mapper;

import com.pegasus.backend.features.catalog.dto.CreateVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.UpdateVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.VariantAttributeResponse;
import com.pegasus.backend.features.catalog.entity.VariantAttribute;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper para VariantAttribute usando MapStruct
 */
@Mapper(componentModel = "spring")
public interface VariantAttributeMapper {

    VariantAttributeResponse toResponse(VariantAttribute entity);

    List<VariantAttributeResponse> toResponseList(List<VariantAttribute> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VariantAttribute toEntity(CreateVariantAttributeRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateVariantAttributeRequest request, @MappingTarget VariantAttribute entity);
}
