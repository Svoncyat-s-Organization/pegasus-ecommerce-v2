package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.BrandResponse;
import com.pegasus.backend.features.catalog.dto.CreateBrandRequest;
import com.pegasus.backend.features.catalog.dto.UpdateBrandRequest;
import com.pegasus.backend.features.catalog.service.BrandService;
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

/**
 * Controlador REST para gestión de Marcas
 */
@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Gestión de marcas del catálogo")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Listar marcas", description = "Obtener todas las marcas con paginación y búsqueda")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<BrandResponse>> getAllBrands(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<BrandResponse> response = brandService.getAllBrands(search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener marca por ID")
    @ApiResponse(responseCode = "200", description = "Marca encontrada")
    @ApiResponse(responseCode = "404", description = "Marca no encontrada")
    public ResponseEntity<BrandResponse> getBrandById(@PathVariable Long id) {
        BrandResponse response = brandService.getBrandById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear marca")
    @ApiResponse(responseCode = "201", description = "Marca creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody CreateBrandRequest request) {
        BrandResponse response = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar marca")
    @ApiResponse(responseCode = "200", description = "Marca actualizada exitosamente")
    @ApiResponse(responseCode = "404", description = "Marca no encontrada")
    public ResponseEntity<BrandResponse> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBrandRequest request) {
        BrandResponse response = brandService.updateBrand(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar marca", description = "Eliminación física permanente. Solo permitida si no tiene productos asociados")
    @ApiResponse(responseCode = "204", description = "Marca eliminada exitosamente")
    @ApiResponse(responseCode = "404", description = "Marca no encontrada")
    @ApiResponse(responseCode = "400", description = "No se puede eliminar porque tiene productos asociados")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Alternar estado activo/inactivo")
    @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente")
    public ResponseEntity<BrandResponse> toggleBrandStatus(@PathVariable Long id) {
        BrandResponse response = brandService.toggleBrandStatus(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/generate-slug")
    @Operation(summary = "Generar slug", description = "Genera un slug URL-friendly a partir de un nombre")
    @ApiResponse(responseCode = "200", description = "Slug generado exitosamente")
    public ResponseEntity<String> generateSlug(@RequestParam String name) {
        String slug = brandService.generateSlug(name);
        return ResponseEntity.ok(slug);
    }
}
