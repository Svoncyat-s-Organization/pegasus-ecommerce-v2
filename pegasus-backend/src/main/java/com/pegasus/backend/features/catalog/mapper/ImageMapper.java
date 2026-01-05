package com.pegasus.backend.features.catalog.mapper;

import com.pegasus.backend.features.catalog.dto.CreateImageRequest;
import com.pegasus.backend.features.catalog.dto.ImageResponse;
import com.pegasus.backend.features.catalog.dto.UpdateImageRequest;
import com.pegasus.backend.features.catalog.entity.Image;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper para Image usando MapStruct
 */
@Mapper(componentModel = "spring")
public interface ImageMapper {

    ImageResponse toResponse(Image image);

    List<ImageResponse> toResponseList(List<Image> images);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "variant", ignore = true)
    Image toEntity(CreateImageRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "variantId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "variant", ignore = true)
    void updateEntityFromDto(UpdateImageRequest request, @MappingTarget Image image);
}
