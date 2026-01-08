package com.pegasus.backend.features.catalog.mapper;

import com.pegasus.backend.features.catalog.dto.CategorySpecificationResponse;
import com.pegasus.backend.features.catalog.dto.CreateCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.dto.SaveCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.dto.UpdateCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.entity.CategorySpecification;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper para CategorySpecification usando MapStruct
 */
@Mapper(componentModel = "spring")
public interface CategorySpecificationMapper {

    CategorySpecificationResponse toResponse(CategorySpecification entity);

    List<CategorySpecificationResponse> toResponseList(List<CategorySpecification> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CategorySpecification toEntity(CreateCategorySpecificationRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateCategorySpecificationRequest request, @MappingTarget CategorySpecification entity);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "categoryId", ignore = true)
    CategorySpecification toEntity(SaveCategorySpecificationRequest request);
}
