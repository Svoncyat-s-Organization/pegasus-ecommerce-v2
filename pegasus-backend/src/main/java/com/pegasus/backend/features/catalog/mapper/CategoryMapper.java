package com.pegasus.backend.features.catalog.mapper;

import com.pegasus.backend.features.catalog.dto.CategoryResponse;
import com.pegasus.backend.features.catalog.dto.CreateCategoryRequest;
import com.pegasus.backend.features.catalog.dto.UpdateCategoryRequest;
import com.pegasus.backend.features.catalog.entity.Category;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper para Category usando MapStruct
 */
@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(source = "parent.name", target = "parentName")
    CategoryResponse toResponse(Category category);

    List<CategoryResponse> toResponseList(List<Category> categories);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Category toEntity(CreateCategoryRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(UpdateCategoryRequest request, @MappingTarget Category category);
}
