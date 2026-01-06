package com.pegasus.backend.features.purchase.mapper;

import com.pegasus.backend.features.purchase.dto.PurchaseItemResponse;
import com.pegasus.backend.features.purchase.dto.PurchaseResponse;
import com.pegasus.backend.features.purchase.entity.Purchase;
import com.pegasus.backend.features.purchase.entity.PurchaseItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { SupplierMapper.class })
public interface PurchaseMapper {

    @Mapping(target = "items", source = "items")
    PurchaseResponse toResponse(Purchase entity);

    @Mapping(target = "variantSku", ignore = true)
    @Mapping(target = "productName", ignore = true)
    PurchaseItemResponse toItemResponse(PurchaseItem entity);
}
