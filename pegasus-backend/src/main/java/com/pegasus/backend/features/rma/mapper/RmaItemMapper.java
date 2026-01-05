package com.pegasus.backend.features.rma.mapper;

import com.pegasus.backend.features.rma.dto.RmaItemResponse;
import com.pegasus.backend.features.rma.entity.RmaItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper MapStruct para RmaItem
 */
@Mapper(componentModel = "spring")
public interface RmaItemMapper {

    @Mapping(target = "variantSku", source = "variant.sku")
    @Mapping(target = "productName", source = "orderItem.productName")
    @Mapping(target = "inspectorName", expression = "java(getInspectorFullName(entity))")
    RmaItemResponse toResponse(RmaItem entity);

    List<RmaItemResponse> toResponseList(List<RmaItem> entities);

    /**
     * Helper method para obtener nombre completo del inspector
     */
    default String getInspectorFullName(RmaItem rmaItem) {
        if (rmaItem.getInspector() != null) {
            return rmaItem.getInspector().getFirstName() + " " + rmaItem.getInspector().getLastName();
        }
        return null;
    }
}
