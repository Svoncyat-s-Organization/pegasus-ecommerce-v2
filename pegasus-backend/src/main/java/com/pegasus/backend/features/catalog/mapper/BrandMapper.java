package com.pegasus.backend.features.catalog.mapper;

import com.pegasus.backend.features.catalog.dto.BrandResponse;
import com.pegasus.backend.features.catalog.dto.CreateBrandRequest;
import com.pegasus.backend.features.catalog.dto.UpdateBrandRequest;
import com.pegasus.backend.features.catalog.entity.Brand;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper para Brand usando MapStruct
 */
@Mapper(componentModel = "spring")
public interface BrandMapper {

    BrandResponse toResponse(Brand brand);

    List<BrandResponse> toResponseList(List<Brand> brands);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Brand toEntity(CreateBrandRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(UpdateBrandRequest request, @MappingTarget Brand brand);
}
