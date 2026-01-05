package com.pegasus.backend.features.inventory.mapper;

import com.pegasus.backend.features.inventory.dto.StockResponse;
import com.pegasus.backend.features.inventory.dto.StockSummaryResponse;
import com.pegasus.backend.features.inventory.entity.Stock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para Stock
 */
@Mapper(componentModel = "spring")
public interface StockMapper {

    @Mapping(source = "warehouse.id", target = "warehouseId")
    @Mapping(source = "warehouse.code", target = "warehouseCode")
    @Mapping(source = "warehouse.name", target = "warehouseName")
    @Mapping(source = "variant.id", target = "variantId")
    @Mapping(source = "variant.sku", target = "variantSku")
    @Mapping(source = "variant.product.name", target = "productName")
    @Mapping(expression = "java(stock.getAvailableQuantity())", target = "availableQuantity")
    StockResponse toResponse(Stock stock);

    @Mapping(source = "warehouse.id", target = "warehouseId")
    @Mapping(source = "warehouse.code", target = "warehouseCode")
    @Mapping(source = "variant.id", target = "variantId")
    @Mapping(source = "variant.sku", target = "variantSku")
    @Mapping(expression = "java(stock.getAvailableQuantity())", target = "availableQuantity")
    StockSummaryResponse toSummaryResponse(Stock stock);
}
