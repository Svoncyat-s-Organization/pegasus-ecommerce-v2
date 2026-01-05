package com.pegasus.backend.features.inventory.controller;

import com.pegasus.backend.features.inventory.dto.*;
import com.pegasus.backend.features.inventory.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de stock
 */
@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
@Tag(name = "Stock", description = "Gestión de inventario de stock")
public class StockController {

    private final StockService stockService;

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Obtener stock de un almacén")
    public ResponseEntity<Page<StockResponse>> getStockByWarehouse(
            @PathVariable Long warehouseId,
            Pageable pageable) {
        return ResponseEntity.ok(stockService.getStockByWarehouse(warehouseId, pageable));
    }

    @GetMapping("/variant/{variantId}")
    @Operation(summary = "Obtener stock de una variante en todos los almacenes")
    public ResponseEntity<List<StockSummaryResponse>> getStockByVariant(@PathVariable Long variantId) {
        return ResponseEntity.ok(stockService.getStockByVariant(variantId));
    }

    @GetMapping("/warehouse/{warehouseId}/variant/{variantId}")
    @Operation(summary = "Obtener stock de una variante en un almacén específico")
    public ResponseEntity<StockResponse> getStockByWarehouseAndVariant(
            @PathVariable Long warehouseId,
            @PathVariable Long variantId) {
        return ResponseEntity.ok(stockService.getStockByWarehouseAndVariant(warehouseId, variantId));
    }

    @GetMapping("/availability")
    @Operation(summary = "Verificar disponibilidad de stock")
    public ResponseEntity<StockAvailabilityResponse> checkStockAvailability(
            @RequestParam Long warehouseId,
            @RequestParam Long variantId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(stockService.checkStockAvailability(warehouseId, variantId, quantity));
    }

    @GetMapping("/warehouse/{warehouseId}/low-stock")
    @Operation(summary = "Obtener variantes con stock bajo")
    public ResponseEntity<List<StockSummaryResponse>> getLowStockByWarehouse(
            @PathVariable Long warehouseId,
            @RequestParam(defaultValue = "10") Integer threshold) {
        return ResponseEntity.ok(stockService.getLowStockByWarehouse(warehouseId, threshold));
    }

    @PostMapping("/adjust")
    @Operation(summary = "Ajustar stock manualmente")
    public ResponseEntity<StockResponse> adjustStock(
            @Valid @RequestBody AdjustStockRequest request,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(stockService.adjustStock(request, userId));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transferir stock entre almacenes")
    public ResponseEntity<Void> transferStock(
            @Valid @RequestBody TransferStockRequest request,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        stockService.transferStock(request, userId);
        return ResponseEntity.ok().build();
    }

    private Long extractUserId(Authentication authentication) {
        // Implementación pendiente según el sistema de autenticación
        // Por ahora retorna un ID fijo (1L)
        return 1L;
    }
}
