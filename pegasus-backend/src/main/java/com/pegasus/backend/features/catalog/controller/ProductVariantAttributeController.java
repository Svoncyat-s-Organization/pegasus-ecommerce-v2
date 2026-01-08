package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.AssignVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.ProductVariantAttributeResponse;
import com.pegasus.backend.features.catalog.dto.SaveProductVariantAttributeRequest;
import com.pegasus.backend.features.catalog.service.ProductVariantAttributeService;
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
 * Controlador REST para gestión de asignaciones de atributos de variantes a productos
 */
@RestController
@RequestMapping("/api/admin/products/{productId}/variant-attributes")
@RequiredArgsConstructor
@Tag(name = "Product Variant Attributes", description = "Asignación de atributos de variantes a productos")
public class ProductVariantAttributeController {

    private final ProductVariantAttributeService assignmentService;

    @GetMapping
    @Operation(summary = "Listar atributos asignados", description = "Obtener todos los atributos de variantes asignados a un producto")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<ProductVariantAttributeResponse>> getAssignedAttributes(
            @PathVariable Long productId) {
        List<ProductVariantAttributeResponse> response = assignmentService.getAttributesByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Asignar atributo", description = "Asignar un atributo de variante del catálogo global al producto")
    @ApiResponse(responseCode = "201", description = "Atributo asignado exitosamente")
    @ApiResponse(responseCode = "400", description = "Atributo ya asignado o datos inválidos")
    public ResponseEntity<ProductVariantAttributeResponse> assignAttribute(
            @PathVariable Long productId,
            @Valid @RequestBody AssignVariantAttributeRequest request) {
        ProductVariantAttributeResponse response = assignmentService.assignAttribute(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{assignmentId}")
    @Operation(summary = "Desasignar atributo", description = "Eliminar la asignación de un atributo del producto")
    @ApiResponse(responseCode = "204", description = "Atributo desasignado")
    @ApiResponse(responseCode = "404", description = "Asignación no encontrada")
    public ResponseEntity<Void> unassignAttribute(
            @PathVariable Long productId,
            @PathVariable Long assignmentId) {
        assignmentService.unassignAttribute(productId, assignmentId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{assignmentId}/custom-options")
    @Operation(summary = "Actualizar opciones personalizadas", description = "Actualizar las opciones personalizadas de una asignación")
    @ApiResponse(responseCode = "200", description = "Opciones actualizadas")
    public ResponseEntity<ProductVariantAttributeResponse> updateCustomOptions(
            @PathVariable Long productId,
            @PathVariable Long assignmentId,
            @RequestBody List<String> customOptions) {
        ProductVariantAttributeResponse response = assignmentService.updateCustomOptions(productId, assignmentId, customOptions);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    @Operation(summary = "Guardar todas las asignaciones", description = "Guardar/actualizar todas las asignaciones de atributos del producto en batch")
    @ApiResponse(responseCode = "200", description = "Asignaciones guardadas exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<List<ProductVariantAttributeResponse>> saveAllAssignments(
            @PathVariable Long productId,
            @Valid @RequestBody List<SaveProductVariantAttributeRequest> requests) {
        List<ProductVariantAttributeResponse> response = assignmentService.saveAllAssignments(productId, requests);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reorder")
    @Operation(summary = "Reordenar asignaciones", description = "Cambiar el orden de visualización de los atributos asignados")
    @ApiResponse(responseCode = "200", description = "Orden actualizado")
    public ResponseEntity<List<ProductVariantAttributeResponse>> reorderAssignments(
            @PathVariable Long productId,
            @RequestBody List<Long> assignmentIds) {
        List<ProductVariantAttributeResponse> response = assignmentService.reorderAssignments(productId, assignmentIds);
        return ResponseEntity.ok(response);
    }
}
