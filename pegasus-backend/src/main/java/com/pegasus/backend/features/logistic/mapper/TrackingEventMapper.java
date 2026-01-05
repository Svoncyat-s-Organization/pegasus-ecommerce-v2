package com.pegasus.backend.features.logistic.mapper;

import com.pegasus.backend.features.logistic.dto.CreateTrackingEventRequest;
import com.pegasus.backend.features.logistic.dto.TrackingEventResponse;
import com.pegasus.backend.features.logistic.entity.TrackingEvent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TrackingEventMapper {

    @Mapping(source = "shipment.id", target = "shipmentId")
    @Mapping(source = "createdBy.id", target = "createdById")
    @Mapping(source = "createdBy.username", target = "createdByUsername")
    TrackingEventResponse toResponse(TrackingEvent entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "shipment", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    TrackingEvent toEntity(CreateTrackingEventRequest request);
}
