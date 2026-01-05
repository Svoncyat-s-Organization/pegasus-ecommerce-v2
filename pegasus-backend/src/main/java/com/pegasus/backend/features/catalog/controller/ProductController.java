package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.CreateProductRequest;
import com.pegasus.backend.features.catalog.dto.ProductResponse;
import com.pegasus.backend.features.catalog.dto.UpdateProductRequest;
import com.pegasus.backend.features.catalog.service.ProductService;
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
 * Controlador REST para gestión de Productos
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Gestión de productos del catálogo")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Listar productos", description = "Obtener todos los productos con paginación y búsqueda")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<ProductResponse> response = productService.getAllProducts(search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/featured")
    @Operation(summary = "Obtener productos destacados")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<ProductResponse>> getFeaturedProducts(
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<ProductResponse> response = productService.getFeaturedProducts(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-category/{categoryId}")
    @Operation(summary = "Obtener productos por categoría")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<ProductResponse> response = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-brand/{brandId}")
    @Operation(summary = "Obtener productos por marca")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<ProductResponse>> getProductsByBrand(
            @PathVariable Long brandId,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<ProductResponse> response = productService.getProductsByBrand(brandId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID")
    @ApiResponse(responseCode = "200", description = "Producto encontrado")
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear producto")
    @ApiResponse(responseCode = "201", description = "Producto creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto")
    @ApiResponse(responseCode = "200", description = "Producto actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto", description = "Eliminación lógica (soft delete)")
    @ApiResponse(responseCode = "204", description = "Producto eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Alternar estado activo/inactivo")
    @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente")
    public ResponseEntity<ProductResponse> toggleProductStatus(@PathVariable Long id) {
        ProductResponse response = productService.toggleProductStatus(id);
        return ResponseEntity.ok(response);
    }
}
