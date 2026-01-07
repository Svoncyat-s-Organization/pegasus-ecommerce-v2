package com.pegasus.backend.features.catalog.controller;

import com.pegasus.backend.features.catalog.dto.BrandResponse;
import com.pegasus.backend.features.catalog.dto.CategoryResponse;
import com.pegasus.backend.features.catalog.dto.ImageResponse;
import com.pegasus.backend.features.catalog.dto.ProductResponse;
import com.pegasus.backend.features.catalog.dto.VariantResponse;
import com.pegasus.backend.features.catalog.service.BrandService;
import com.pegasus.backend.features.catalog.service.CategoryService;
import com.pegasus.backend.features.catalog.service.ImageService;
import com.pegasus.backend.features.catalog.service.ProductService;
import com.pegasus.backend.features.catalog.service.VariantService;
import com.pegasus.backend.features.inventory.dto.StockSummaryResponse;
import com.pegasus.backend.features.inventory.service.StockService;
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
    private final VariantService variantService;
    private final ImageService imageService;
    private final StockService stockService;

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
            @RequestParam(defaultValue = "12") int size) {
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
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<Long> brandIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ProductResponse> response = productService.getPublicProducts(search, categoryIds, brandIds,
                pageable);
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
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ProductResponse> response = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/catalog/products/by-brand/{brandId}
     * Obtiene productos de una marca (públicamente accesible)
     */
    @GetMapping("/products/by-brand/{brandId}")
    public ResponseEntity<PageResponse<ProductResponse>> getProductsByBrand(
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ProductResponse> response = productService.getProductsByBrand(brandId, pageable);
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
     * GET /api/public/catalog/categories/tree
     * Obtiene categorías en estructura jerárquica (árbol)
     */
    @GetMapping("/categories/tree")
    public ResponseEntity<List<CategoryResponse>> getCategoriesTree() {
        List<CategoryResponse> response = categoryService.getCategoriesTree();
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
            @RequestParam(defaultValue = "100") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<BrandResponse> response = brandService.getAllBrands(null, pageable);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // VARIANTS (Public)
    // ============================================

    /**
     * GET /api/public/catalog/products/{productId}/variants
     * Obtiene variantes activas de un producto (públicamente accesible)
     */
    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<List<VariantResponse>> getProductVariants(@PathVariable Long productId) {
        List<VariantResponse> response = variantService.getActiveVariantsByProductId(productId);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // IMAGES (Public)
    // ============================================

    /**
     * GET /api/public/catalog/products/{productId}/images
     * Obtiene imágenes de un producto (públicamente accesible)
     */
    @GetMapping("/products/{productId}/images")
    public ResponseEntity<List<ImageResponse>> getProductImages(@PathVariable Long productId) {
        List<ImageResponse> response = imageService.getImagesByProductId(productId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/catalog/variants/{variantId}/images
     * Obtiene imágenes de una variante específica (públicamente accesible)
     */
    @GetMapping("/variants/{variantId}/images")
    public ResponseEntity<List<ImageResponse>> getVariantImages(@PathVariable Long variantId) {
        List<ImageResponse> response = imageService.getImagesByVariantId(variantId);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // STOCK (Public - Total stock across all warehouses)
    // ============================================

    /**
     * GET /api/public/catalog/variants/{variantId}/stock
     * Obtiene stock total de una variante (suma de todos los almacenes)
     */
    @GetMapping("/variants/{variantId}/stock")
    public ResponseEntity<Integer> getVariantTotalStock(@PathVariable Long variantId) {
        List<StockSummaryResponse> stockList = stockService.getStockByVariant(variantId);
        int totalStock = stockList.stream()
                .mapToInt(StockSummaryResponse::quantity)
                .sum();
        return ResponseEntity.ok(totalStock);
    }
}
