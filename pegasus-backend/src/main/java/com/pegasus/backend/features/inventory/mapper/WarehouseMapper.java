package com.pegasus.backend.features.inventory.mapper;

import com.pegasus.backend.features.inventory.dto.CreateWarehouseRequest;
import com.pegasus.backend.features.inventory.dto.UpdateWarehouseRequest;
import com.pegasus.backend.features.inventory.dto.WarehouseResponse;
import com.pegasus.backend.features.inventory.entity.Warehouse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper para Warehouse
 */
@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    WarehouseResponse toResponse(Warehouse warehouse);

    @Mapping(target = "id", ignore = true)
    Warehouse toEntity(CreateWarehouseRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    void updateEntity(UpdateWarehouseRequest request, @MappingTarget Warehouse warehouse);
}
