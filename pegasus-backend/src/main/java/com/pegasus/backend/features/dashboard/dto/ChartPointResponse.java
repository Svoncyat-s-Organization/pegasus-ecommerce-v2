package com.pegasus.backend.features.dashboard.dto;

import java.math.BigDecimal;

/**
 * Punto de datos para gráficos temporales
 * Representa un valor en un momento específico del tiempo
 *
 * @param label Etiqueta del punto (fecha formateada, ej: "2026-01-05" o "Enero")
 * @param value Valor numérico del punto
 * @param count Cantidad de elementos (opcional, para pedidos)
 */
public record ChartPointResponse(
        String label,
        BigDecimal value,
        Long count
) {}
