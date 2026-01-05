package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.CreateVariantRequest;
import com.pegasus.backend.features.catalog.dto.UpdateVariantRequest;
import com.pegasus.backend.features.catalog.dto.VariantResponse;
import com.pegasus.backend.features.catalog.service.VariantService;
import com.pegasus.backend.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de Variantes
 */
@RestController
@RequestMapping("/api/admin/variants")
@RequiredArgsConstructor
@Tag(name = "Variants", description = "Gestión de variantes de productos")
public class VariantController {

    private final VariantService variantService;

    @GetMapping
    @Operation(summary = "Listar variantes", description = "Obtener todas las variantes con paginación y búsqueda")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<VariantResponse>> getAllVariants(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<VariantResponse> response = variantService.getAllVariants(search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-product/{productId}")
    @Operation(summary = "Obtener variantes por producto")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<VariantResponse>> getVariantsByProductId(@PathVariable Long productId) {
        List<VariantResponse> response = variantService.getVariantsByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-product/{productId}/active")
    @Operation(summary = "Obtener variantes activas por producto")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<VariantResponse>> getActiveVariantsByProductId(@PathVariable Long productId) {
        List<VariantResponse> response = variantService.getActiveVariantsByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener variante por ID")
    @ApiResponse(responseCode = "200", description = "Variante encontrada")
    @ApiResponse(responseCode = "404", description = "Variante no encontrada")
    public ResponseEntity<VariantResponse> getVariantById(@PathVariable Long id) {
        VariantResponse response = variantService.getVariantById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear variante")
    @ApiResponse(responseCode = "201", description = "Variante creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<VariantResponse> createVariant(@Valid @RequestBody CreateVariantRequest request) {
        VariantResponse response = variantService.createVariant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar variante")
    @ApiResponse(responseCode = "200", description = "Variante actualizada exitosamente")
    @ApiResponse(responseCode = "404", description = "Variante no encontrada")
    public ResponseEntity<VariantResponse> updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVariantRequest request) {
        VariantResponse response = variantService.updateVariant(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar variante", description = "Eliminación lógica (soft delete)")
    @ApiResponse(responseCode = "204", description = "Variante eliminada exitosamente")
    @ApiResponse(responseCode = "404", description = "Variante no encontrada")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long id) {
        variantService.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Alternar estado activo/inactivo")
    @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente")
    public ResponseEntity<VariantResponse> toggleVariantStatus(@PathVariable Long id) {
        VariantResponse response = variantService.toggleVariantStatus(id);
        return ResponseEntity.ok(response);
    }
}
