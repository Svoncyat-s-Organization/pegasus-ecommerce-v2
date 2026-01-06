package com.pegasus.backend.features.dashboard.controller;

import com.pegasus.backend.features.dashboard.dto.*;
import com.pegasus.backend.features.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST para el Dashboard del Backoffice
 * Proporciona métricas, KPIs y datos para gráficos
 * Todos los endpoints son de solo lectura
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Métricas y estadísticas del negocio")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(
            summary = "Obtener resumen completo del dashboard",
            description = "Retorna todas las métricas, KPIs y datos para gráficos en una sola llamada. " +
                    "Optimizado para minimizar requests desde el frontend."
    )
    @ApiResponse(responseCode = "200", description = "Resumen obtenido exitosamente")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/sales")
    @Operation(
            summary = "Obtener métricas de ventas",
            description = "Métricas de ventas del período actual con comparativa vs período anterior"
    )
    @ApiResponse(responseCode = "200", description = "Métricas obtenidas exitosamente")
    public ResponseEntity<SalesMetricsResponse> getSalesMetrics() {
        SalesMetricsResponse metrics = dashboardService.getSalesMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/customers")
    @Operation(
            summary = "Obtener métricas de clientes",
            description = "Total de clientes, nuevos registros y crecimiento"
    )
    @ApiResponse(responseCode = "200", description = "Métricas obtenidas exitosamente")
    public ResponseEntity<CustomerMetricsResponse> getCustomerMetrics() {
        CustomerMetricsResponse metrics = dashboardService.getCustomerMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/inventory")
    @Operation(
            summary = "Obtener métricas de inventario",
            description = "Estado del inventario, productos con stock bajo y valor total"
    )
    @ApiResponse(responseCode = "200", description = "Métricas obtenidas exitosamente")
    public ResponseEntity<InventoryMetricsResponse> getInventoryMetrics() {
        InventoryMetricsResponse metrics = dashboardService.getInventoryMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/purchases")
    @Operation(
            summary = "Obtener métricas de compras",
            description = "Compras del período, montos y pendientes"
    )
    @ApiResponse(responseCode = "200", description = "Métricas obtenidas exitosamente")
    public ResponseEntity<PurchaseMetricsResponse> getPurchaseMetrics() {
        PurchaseMetricsResponse metrics = dashboardService.getPurchaseMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/rma")
    @Operation(
            summary = "Obtener métricas de devoluciones (RMA)",
            description = "RMAs pendientes, en proceso, completadas y tasa de devolución"
    )
    @ApiResponse(responseCode = "200", description = "Métricas obtenidas exitosamente")
    public ResponseEntity<RmaMetricsResponse> getRmaMetrics() {
        RmaMetricsResponse metrics = dashboardService.getRmaMetrics();
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/orders-by-status")
    @Operation(
            summary = "Obtener pedidos agrupados por estado",
            description = "Cantidad de pedidos en cada estado del ciclo de vida"
    )
    @ApiResponse(responseCode = "200", description = "Datos obtenidos exitosamente")
    public ResponseEntity<List<OrdersByStatusResponse>> getOrdersByStatus() {
        List<OrdersByStatusResponse> data = dashboardService.getOrdersByStatus();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/top-products")
    @Operation(
            summary = "Obtener productos más vendidos",
            description = "Lista de productos con mayor cantidad vendida"
    )
    @ApiResponse(responseCode = "200", description = "Datos obtenidos exitosamente")
    public ResponseEntity<List<TopProductResponse>> getTopProducts(
            @RequestParam(defaultValue = "5") int limit
    ) {
        List<TopProductResponse> data = dashboardService.getTopProducts(limit);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/recent-orders")
    @Operation(
            summary = "Obtener pedidos recientes",
            description = "Lista de los pedidos más recientes"
    )
    @ApiResponse(responseCode = "200", description = "Datos obtenidos exitosamente")
    public ResponseEntity<List<RecentOrderResponse>> getRecentOrders(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<RecentOrderResponse> data = dashboardService.getRecentOrders(limit);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/charts")
    @Operation(
            summary = "Obtener datos para gráficos de ventas",
            description = "Ventas diarias (últimos 30 días) y mensuales (últimos 12 meses)"
    )
    @ApiResponse(responseCode = "200", description = "Datos obtenidos exitosamente")
    public ResponseEntity<SalesChartDataResponse> getSalesChartData() {
        SalesChartDataResponse data = dashboardService.getSalesChartData();
        return ResponseEntity.ok(data);
    }
}
