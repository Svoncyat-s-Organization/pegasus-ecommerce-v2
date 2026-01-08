package com.pegasus.backend.features.catalog.mapper;

import com.pegasus.backend.features.catalog.dto.AssignVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.ProductVariantAttributeResponse;
import com.pegasus.backend.features.catalog.dto.SaveProductVariantAttributeRequest;
import com.pegasus.backend.features.catalog.entity.ProductVariantAttribute;
import com.pegasus.backend.features.catalog.entity.VariantAttribute;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper para ProductVariantAttribute usando MapStruct
 */
@Mapper(componentModel = "spring")
public interface ProductVariantAttributeMapper {

    @Mapping(target = "attributeName", source = "variantAttribute.name")
    @Mapping(target = "attributeDisplayName", source = "variantAttribute.displayName")
    @Mapping(target = "attributeType", source = "variantAttribute.attributeType")
    @Mapping(target = "globalOptions", source = "variantAttribute.options")
    @Mapping(target = "effectiveOptions", expression = "java(getEffectiveOptions(entity))")
    ProductVariantAttributeResponse toResponse(ProductVariantAttribute entity);

    List<ProductVariantAttributeResponse> toResponseList(List<ProductVariantAttribute> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "variantAttribute", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductVariantAttribute toEntity(AssignVariantAttributeRequest request);

    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "variantAttribute", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductVariantAttribute toEntity(SaveProductVariantAttributeRequest request);

    /**
     * Get effective options (custom if available, otherwise global)
     */
    default List<String> getEffectiveOptions(ProductVariantAttribute entity) {
        if (entity.getCustomOptions() != null && !entity.getCustomOptions().isEmpty()) {
            return entity.getCustomOptions();
        }
        if (entity.getVariantAttribute() != null) {
            return entity.getVariantAttribute().getOptions();
        }
        return List.of();
    }
}
