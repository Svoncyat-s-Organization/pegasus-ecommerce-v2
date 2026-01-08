package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.CategorySpecificationResponse;
import com.pegasus.backend.features.catalog.dto.CreateCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.dto.SaveCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.dto.UpdateCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.service.CategorySpecificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de Especificaciones de Categoría
 * Define campos de especificación a nivel de categoría con soporte de herencia
 */
@RestController
@RequestMapping("/api/admin/categories/{categoryId}/specifications")
@RequiredArgsConstructor
@Tag(name = "Category Specifications", description = "Gestión de especificaciones por categoría")
public class CategorySpecificationController {

    private final CategorySpecificationService specificationService;

    @GetMapping
    @Operation(summary = "Listar especificaciones de una categoría", description = "Obtener todas las especificaciones definidas para una categoría (sin herencia)")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<CategorySpecificationResponse>> getSpecificationsByCategory(
            @PathVariable Long categoryId) {
        List<CategorySpecificationResponse> response = specificationService.getSpecificationsByCategoryId(categoryId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/with-inheritance")
    @Operation(summary = "Listar especificaciones con herencia", description = "Obtener especificaciones incluyendo las heredadas de categorías padre")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<CategorySpecificationResponse>> getSpecificationsWithInheritance(
            @PathVariable Long categoryId) {
        List<CategorySpecificationResponse> response = specificationService.getSpecificationsWithInheritance(categoryId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener especificación por ID")
    @ApiResponse(responseCode = "200", description = "Especificación encontrada")
    @ApiResponse(responseCode = "404", description = "Especificación no encontrada")
    public ResponseEntity<CategorySpecificationResponse> getSpecificationById(
            @PathVariable Long categoryId,
            @PathVariable Long id) {
        CategorySpecificationResponse response = specificationService.getSpecificationById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear especificación", description = "Crear una nueva especificación para la categoría")
    @ApiResponse(responseCode = "201", description = "Especificación creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<CategorySpecificationResponse> createSpecification(
            @PathVariable Long categoryId,
            @Valid @RequestBody CreateCategorySpecificationRequest request) {
        // Asegurar que el categoryId del path se use
        request.setCategoryId(categoryId);
        CategorySpecificationResponse response = specificationService.createSpecification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar especificación")
    @ApiResponse(responseCode = "200", description = "Especificación actualizada")
    @ApiResponse(responseCode = "404", description = "Especificación no encontrada")
    public ResponseEntity<CategorySpecificationResponse> updateSpecification(
            @PathVariable Long categoryId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategorySpecificationRequest request) {
        CategorySpecificationResponse response = specificationService.updateSpecification(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar especificación", description = "Eliminar una especificación (soft delete)")
    @ApiResponse(responseCode = "204", description = "Especificación eliminada")
    @ApiResponse(responseCode = "404", description = "Especificación no encontrada")
    public ResponseEntity<Void> deleteSpecification(
            @PathVariable Long categoryId,
            @PathVariable Long id) {
        specificationService.deleteSpecification(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    @Operation(summary = "Guardar todas las especificaciones", description = "Guardar/actualizar todas las especificaciones de una categoría en batch")
    @ApiResponse(responseCode = "200", description = "Especificaciones guardadas exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<List<CategorySpecificationResponse>> saveAllSpecifications(
            @PathVariable Long categoryId,
            @Valid @RequestBody List<SaveCategorySpecificationRequest> requests) {
        List<CategorySpecificationResponse> response = specificationService.saveAllSpecifications(categoryId, requests);
        return ResponseEntity.ok(response);
    }
}
