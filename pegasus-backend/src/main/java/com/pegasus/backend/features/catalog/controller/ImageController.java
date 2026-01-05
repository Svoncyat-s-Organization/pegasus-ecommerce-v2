package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.CreateImageRequest;
import com.pegasus.backend.features.catalog.dto.ImageResponse;
import com.pegasus.backend.features.catalog.dto.UpdateImageRequest;
import com.pegasus.backend.features.catalog.service.ImageService;
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
 * Controlador REST para gestión de Imágenes
 */
@RestController
@RequestMapping("/api/admin/images")
@RequiredArgsConstructor
@Tag(name = "Images", description = "Gestión de imágenes de productos y variantes")
public class ImageController {

    private final ImageService imageService;

    @GetMapping("/by-product/{productId}")
    @Operation(summary = "Obtener imágenes por producto")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<ImageResponse>> getImagesByProductId(@PathVariable Long productId) {
        List<ImageResponse> response = imageService.getImagesByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-variant/{variantId}")
    @Operation(summary = "Obtener imágenes por variante")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<ImageResponse>> getImagesByVariantId(@PathVariable Long variantId) {
        List<ImageResponse> response = imageService.getImagesByVariantId(variantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener imagen por ID")
    @ApiResponse(responseCode = "200", description = "Imagen encontrada")
    @ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    public ResponseEntity<ImageResponse> getImageById(@PathVariable Long id) {
        ImageResponse response = imageService.getImageById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear imagen")
    @ApiResponse(responseCode = "201", description = "Imagen creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<ImageResponse> createImage(@Valid @RequestBody CreateImageRequest request) {
        ImageResponse response = imageService.createImage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar imagen")
    @ApiResponse(responseCode = "200", description = "Imagen actualizada exitosamente")
    @ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    public ResponseEntity<ImageResponse> updateImage(
            @PathVariable Long id,
            @Valid @RequestBody UpdateImageRequest request) {
        ImageResponse response = imageService.updateImage(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar imagen", description = "Eliminación permanente")
    @ApiResponse(responseCode = "204", description = "Imagen eliminada exitosamente")
    @ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        imageService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}
