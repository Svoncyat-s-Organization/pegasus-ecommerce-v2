package com.pegasus.backend.features.inventory.mapper;

import com.pegasus.backend.features.inventory.dto.MovementResponse;
import com.pegasus.backend.features.inventory.entity.Movement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para Movement
 */
@Mapper(componentModel = "spring")
public interface MovementMapper {

    @Mapping(source = "variant.id", target = "variantId")
    @Mapping(source = "variant.sku", target = "variantSku")
    @Mapping(source = "variant.product.name", target = "productName")
    @Mapping(source = "warehouse.id", target = "warehouseId")
    @Mapping(source = "warehouse.code", target = "warehouseCode")
    @Mapping(source = "warehouse.name", target = "warehouseName")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "username")
    MovementResponse toResponse(Movement movement);
}
