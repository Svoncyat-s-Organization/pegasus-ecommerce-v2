package com.pegasus.backend.features.order.dto;

import java.math.BigDecimal;

/**
 * DTO de respuesta para items del pedido
 */
public record OrderItemResponse(
        Long id,
        Long productId,
        Long variantId,
        String sku,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal total
) {}
