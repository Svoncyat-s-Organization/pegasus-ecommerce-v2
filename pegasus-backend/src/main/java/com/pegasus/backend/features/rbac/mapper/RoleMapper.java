package com.pegasus.backend.features.rbac.mapper;

import com.pegasus.backend.features.rbac.dto.CreateRoleRequest;
import com.pegasus.backend.features.rbac.dto.RoleResponse;
import com.pegasus.backend.features.rbac.dto.UpdateRoleRequest;
import com.pegasus.backend.features.rbac.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct Mapper para Role
 */
@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse toResponse(Role role);

    @Mapping(target = "id", ignore = true)
    Role toEntity(CreateRoleRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(UpdateRoleRequest request, @MappingTarget Role role);
}
