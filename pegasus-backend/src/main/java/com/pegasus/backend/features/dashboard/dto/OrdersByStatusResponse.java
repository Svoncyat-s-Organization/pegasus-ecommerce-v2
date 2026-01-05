package com.pegasus.backend.features.dashboard.dto;

/**
 * Cantidad de pedidos agrupados por estado
 *
 * @param status Estado del pedido
 * @param count Cantidad de pedidos en ese estado
 * @param label Etiqueta en español para UI
 */
public record OrdersByStatusResponse(
        String status,
        Long count,
        String label
) {}
