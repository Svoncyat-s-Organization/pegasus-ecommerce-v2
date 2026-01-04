package com.pegasus.backend.features.rbac.mapper;

import com.pegasus.backend.features.rbac.dto.CreateModuleRequest;
import com.pegasus.backend.features.rbac.dto.ModuleResponse;
import com.pegasus.backend.features.rbac.dto.UpdateModuleRequest;
import com.pegasus.backend.features.rbac.entity.Module;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct Mapper para Module
 */
@Mapper(componentModel = "spring")
public interface ModuleMapper {

    ModuleResponse toResponse(Module module);

    @Mapping(target = "id", ignore = true)
    Module toEntity(CreateModuleRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(UpdateModuleRequest request, @MappingTarget Module module);
}
