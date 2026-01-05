package com.pegasus.backend.features.rma.mapper;

import com.pegasus.backend.features.rma.dto.RmaStatusHistoryResponse;
import com.pegasus.backend.features.rma.entity.RmaStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper MapStruct para RmaStatusHistory
 */
@Mapper(componentModel = "spring")
public interface RmaStatusHistoryMapper {

    @Mapping(target = "creatorName", expression = "java(getCreatorFullName(entity))")
    RmaStatusHistoryResponse toResponse(RmaStatusHistory entity);

    List<RmaStatusHistoryResponse> toResponseList(List<RmaStatusHistory> entities);

    /**
     * Helper method para obtener nombre completo del creador
     */
    default String getCreatorFullName(RmaStatusHistory history) {
        if (history.getCreator() != null) {
            return history.getCreator().getFirstName() + " " + history.getCreator().getLastName();
        }
        return null;
    }
}
