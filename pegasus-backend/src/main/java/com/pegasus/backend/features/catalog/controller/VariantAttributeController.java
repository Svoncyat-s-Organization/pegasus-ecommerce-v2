package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.CreateVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.UpdateVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.VariantAttributeResponse;
import com.pegasus.backend.features.catalog.entity.VariantAttribute;
import com.pegasus.backend.features.catalog.service.VariantAttributeService;
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
 * Controlador REST para gestión del Catálogo Global de Atributos de Variantes
 * Estos atributos son reutilizables en cualquier producto
 */
@RestController
@RequestMapping("/api/admin/variant-attributes")
@RequiredArgsConstructor
@Tag(name = "Variant Attributes", description = "Catálogo global de atributos de variantes")
public class VariantAttributeController {

    private final VariantAttributeService attributeService;

    @GetMapping
    @Operation(summary = "Listar atributos con paginación", description = "Obtener atributos de variantes con búsqueda y paginación")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<VariantAttributeResponse>> getAttributes(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<VariantAttributeResponse> response = attributeService.getAttributes(search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todos los atributos activos", description = "Obtener todos los atributos activos sin paginación (para selects)")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<VariantAttributeResponse>> getAllActiveAttributes() {
        List<VariantAttributeResponse> response = attributeService.getAllActiveAttributes();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener atributo por ID")
    @ApiResponse(responseCode = "200", description = "Atributo encontrado")
    @ApiResponse(responseCode = "404", description = "Atributo no encontrado")
    public ResponseEntity<VariantAttributeResponse> getAttributeById(@PathVariable Long id) {
        VariantAttributeResponse response = attributeService.getAttributeById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Obtener atributo por nombre")
    @ApiResponse(responseCode = "200", description = "Atributo encontrado")
    @ApiResponse(responseCode = "404", description = "Atributo no encontrado")
    public ResponseEntity<VariantAttributeResponse> getAttributeByName(@PathVariable String name) {
        VariantAttributeResponse response = attributeService.getAttributeByName(name);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Listar atributos por tipo")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<VariantAttributeResponse>> getAttributesByType(
            @PathVariable VariantAttribute.AttributeType type) {
        List<VariantAttributeResponse> response = attributeService.getAttributesByType(type);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear atributo", description = "Crear un nuevo atributo global de variantes")
    @ApiResponse(responseCode = "201", description = "Atributo creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o nombre duplicado")
    public ResponseEntity<VariantAttributeResponse> createAttribute(
            @Valid @RequestBody CreateVariantAttributeRequest request) {
        VariantAttributeResponse response = attributeService.createAttribute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar atributo")
    @ApiResponse(responseCode = "200", description = "Atributo actualizado")
    @ApiResponse(responseCode = "404", description = "Atributo no encontrado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o nombre duplicado")
    public ResponseEntity<VariantAttributeResponse> updateAttribute(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVariantAttributeRequest request) {
        VariantAttributeResponse response = attributeService.updateAttribute(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar atributo", description = "Eliminar un atributo (soft delete)")
    @ApiResponse(responseCode = "204", description = "Atributo eliminado")
    @ApiResponse(responseCode = "404", description = "Atributo no encontrado")
    public ResponseEntity<Void> deleteAttribute(@PathVariable Long id) {
        attributeService.deleteAttribute(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/by-ids")
    @Operation(summary = "Obtener múltiples atributos por IDs")
    @ApiResponse(responseCode = "200", description = "Atributos obtenidos")
    public ResponseEntity<List<VariantAttributeResponse>> getAttributesByIds(
            @RequestBody List<Long> ids) {
        List<VariantAttributeResponse> response = attributeService.getAttributesByIds(ids);
        return ResponseEntity.ok(response);
    }
}
