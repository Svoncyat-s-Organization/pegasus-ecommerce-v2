package com.pegasus.backend.features.user.mapper;

import com.pegasus.backend.features.user.dto.CreateUserRequest;
import com.pegasus.backend.features.user.dto.UpdateUserRequest;
import com.pegasus.backend.features.user.dto.UserResponse;
import com.pegasus.backend.features.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct Mapper para User
 * Conversión automática entre Entity y DTOs
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Convierte User entity a UserResponse DTO
     */
    UserResponse toResponse(User user);

    /**
     * Convierte CreateUserRequest a User entity
     * Nota: El password debe ser hasheado antes de guardar
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true) // Se setea manualmente en el service
    @Mapping(target = "isActive", constant = "true")
    User toEntity(CreateUserRequest request);

    /**
     * Actualiza un User existente con datos de UpdateUserRequest
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true) // No se actualiza aquí
    void updateEntity(UpdateUserRequest request, @MappingTarget User user);
}
