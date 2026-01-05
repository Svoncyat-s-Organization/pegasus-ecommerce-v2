package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.BrandResponse;
import com.pegasus.backend.features.catalog.dto.CategoryResponse;
import com.pegasus.backend.features.catalog.dto.ProductResponse;
import com.pegasus.backend.features.catalog.service.BrandService;
import com.pegasus.backend.features.catalog.service.CategoryService;
import com.pegasus.backend.features.catalog.service.ProductService;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public Catalog Controller
 * Endpoints públicos para el storefront (sin autenticación)
 * Path: /api/public/catalog
 */
@RestController
@RequestMapping("/api/public/catalog")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final BrandService brandService;

    // ============================================
    // PRODUCTS
    // ============================================

    /**
     * GET /api/public/catalog/products/featured
     * Obtiene productos destacados (públicamente accesibles)
     */
    @GetMapping("/products/featured")
    public ResponseEntity<PageResponse<ProductResponse>> getFeaturedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ProductResponse> response = productService.getFeaturedProducts(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/catalog/products
     * Lista productos con filtros (públicamente accesible)
     */
    @GetMapping("/products")
    public ResponseEntity<PageResponse<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ProductResponse> response = productService.getAllProducts(search, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/catalog/products/{id}
     * Obtiene detalle de un producto (públicamente accesible)
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/catalog/products/by-category/{categoryId}
     * Obtiene productos de una categoría (públicamente accesible)
     */
    @GetMapping("/products/by-category/{categoryId}")
    public ResponseEntity<PageResponse<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ProductResponse> response = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // CATEGORIES
    // ============================================

    /**
     * GET /api/public/catalog/categories/root
     * Obtiene categorías raíz (públicamente accesible)
     */
    @GetMapping("/categories/root")
    public ResponseEntity<List<CategoryResponse>> getRootCategories() {
        List<CategoryResponse> response = categoryService.getRootCategories();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/catalog/categories/{id}/subcategories
     * Obtiene subcategorías de una categoría (públicamente accesible)
     */
    @GetMapping("/categories/{id}/subcategories")
    public ResponseEntity<List<CategoryResponse>> getSubcategories(@PathVariable Long id) {
        List<CategoryResponse> response = categoryService.getSubcategories(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/catalog/categories/{id}
     * Obtiene detalle de una categoría (públicamente accesible)
     */
    @GetMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // BRANDS
    // ============================================

    /**
     * GET /api/public/catalog/brands
     * Obtiene todas las marcas (públicamente accesible)
     */
    @GetMapping("/brands")
    public ResponseEntity<PageResponse<BrandResponse>> getAllBrands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<BrandResponse> response = brandService.getAllBrands(null, pageable);
        return ResponseEntity.ok(response);
    }
}
