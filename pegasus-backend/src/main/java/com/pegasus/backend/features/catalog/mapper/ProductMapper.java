package com.pegasus.backend.features.catalog.mapper;

import com.pegasus.backend.features.catalog.dto.CreateProductRequest;
import com.pegasus.backend.features.catalog.dto.ProductResponse;
import com.pegasus.backend.features.catalog.dto.UpdateProductRequest;
import com.pegasus.backend.features.catalog.entity.Product;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper para Product usando MapStruct
 */
@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "brand.name", target = "brandName")
    @Mapping(source = "category.name", target = "categoryName")
    ProductResponse toResponse(Product product);

    List<ProductResponse> toResponseList(List<Product> products);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Product toEntity(CreateProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(UpdateProductRequest request, @MappingTarget Product product);
}
