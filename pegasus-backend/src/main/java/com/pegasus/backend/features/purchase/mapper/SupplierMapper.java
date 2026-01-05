package com.pegasus.backend.features.purchase.mapper;

import com.pegasus.backend.features.purchase.dto.CreateSupplierRequest;
import com.pegasus.backend.features.purchase.dto.SupplierResponse;
import com.pegasus.backend.features.purchase.dto.UpdateSupplierRequest;
import com.pegasus.backend.features.purchase.entity.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SupplierMapper {
    SupplierResponse toResponse(Supplier entity);

    Supplier toEntity(CreateSupplierRequest request);

    void updateEntity(UpdateSupplierRequest request, @MappingTarget Supplier entity);
}
