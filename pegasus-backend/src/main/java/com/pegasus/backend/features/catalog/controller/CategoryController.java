package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.CategoryResponse;
import com.pegasus.backend.features.catalog.dto.CreateCategoryRequest;
import com.pegasus.backend.features.catalog.dto.UpdateCategoryRequest;
import com.pegasus.backend.features.catalog.service.CategoryService;
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
 * Controlador REST para gestión de Categorías
 */
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Gestión de categorías del catálogo")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Listar categorías", description = "Obtener todas las categorías con paginación y búsqueda")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<CategoryResponse>> getAllCategories(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<CategoryResponse> response = categoryService.getAllCategories(search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/root")
    @Operation(summary = "Obtener categorías raíz", description = "Obtener categorías sin padre")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<CategoryResponse>> getRootCategories() {
        List<CategoryResponse> response = categoryService.getRootCategories();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/subcategories")
    @Operation(summary = "Obtener subcategorías", description = "Obtener subcategorías de una categoría padre")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<CategoryResponse>> getSubcategories(@PathVariable Long id) {
        List<CategoryResponse> response = categoryService.getSubcategories(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID")
    @ApiResponse(responseCode = "200", description = "Categoría encontrada")
    @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear categoría")
    @ApiResponse(responseCode = "201", description = "Categoría creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar categoría")
    @ApiResponse(responseCode = "200", description = "Categoría actualizada exitosamente")
    @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar categoría", description = "Eliminación lógica (soft delete)")
    @ApiResponse(responseCode = "204", description = "Categoría eliminada exitosamente")
    @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Alternar estado activo/inactivo")
    @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente")
    public ResponseEntity<CategoryResponse> toggleCategoryStatus(@PathVariable Long id) {
        CategoryResponse response = categoryService.toggleCategoryStatus(id);
        return ResponseEntity.ok(response);
    }
}
