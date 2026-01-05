package com.pegasus.backend.features.catalog.mapper;

import com.pegasus.backend.features.catalog.dto.CreateVariantRequest;
import com.pegasus.backend.features.catalog.dto.UpdateVariantRequest;
import com.pegasus.backend.features.catalog.dto.VariantResponse;
import com.pegasus.backend.features.catalog.entity.Variant;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper para Variant usando MapStruct
 */
@Mapper(componentModel = "spring")
public interface VariantMapper {

    VariantResponse toResponse(Variant variant);

    List<VariantResponse> toResponseList(List<Variant> variants);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Variant toEntity(CreateVariantRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(UpdateVariantRequest request, @MappingTarget Variant variant);
}
