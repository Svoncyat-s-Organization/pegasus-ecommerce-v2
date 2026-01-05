package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.CreateProductRequest;
import com.pegasus.backend.features.catalog.dto.ProductResponse;
import com.pegasus.backend.features.catalog.dto.UpdateProductRequest;
import com.pegasus.backend.features.catalog.entity.Product;
import com.pegasus.backend.features.catalog.mapper.ProductMapper;
import com.pegasus.backend.features.catalog.repository.BrandRepository;
import com.pegasus.backend.features.catalog.repository.CategoryRepository;
import com.pegasus.backend.features.catalog.repository.ProductRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service para gestión de productos
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    /**
     * Obtener todos los productos con paginación y búsqueda opcional
     */
    public PageResponse<ProductResponse> getAllProducts(String search, Pageable pageable) {
        log.debug("Getting products with search: {}, page: {}", search, pageable.getPageNumber());

        Page<Product> page = (search != null && !search.isBlank())
                ? productRepository.searchProducts(search.trim(), pageable)
                : productRepository.findAll(pageable);

        List<ProductResponse> content = productMapper.toResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Obtener producto por ID
     */
    public ProductResponse getProductById(Long id) {
        log.debug("Getting product by id: {}", id);
        Product product = findProductById(id);
        return productMapper.toResponse(product);
    }

    /**
     * Obtener productos destacados
     */
    public PageResponse<ProductResponse> getFeaturedProducts(Pageable pageable) {
        log.debug("Getting featured products");
        Page<Product> page = productRepository.findByIsFeaturedTrue(pageable);
        List<ProductResponse> content = productMapper.toResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Obtener productos por categoría
     */
    public PageResponse<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        log.debug("Getting products by category: {}", categoryId);
        Page<Product> page = productRepository.findActiveByCategoryId(categoryId, pageable);
        List<ProductResponse> content = productMapper.toResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Obtener productos por marca
     */
    public PageResponse<ProductResponse> getProductsByBrand(Long brandId, Pageable pageable) {
        log.debug("Getting products by brand: {}", brandId);
        Page<Product> page = productRepository.findActiveByBrandId(brandId, pageable);
        List<ProductResponse> content = productMapper.toResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Crear nuevo producto
     */
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        log.info("Creating product: {}", request.name());

        // Validar unicidad
        if (productRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException("Ya existe un producto con ese código");
        }
        if (productRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Ya existe un producto con ese slug");
        }

        // Validar que la categoría existe
        if (!categoryRepository.existsById(request.categoryId())) {
            throw new ResourceNotFoundException("Categoría no encontrada con ID: " + request.categoryId());
        }

        // Validar que la marca existe si se especifica
        if (request.brandId() != null && !brandRepository.existsById(request.brandId())) {
            throw new ResourceNotFoundException("Marca no encontrada con ID: " + request.brandId());
        }

        Product product = productMapper.toEntity(request);
        Product saved = productRepository.save(product);

        log.info("Product created successfully: {}", saved.getName());
        return productMapper.toResponse(saved);
    }

    /**
     * Actualizar producto existente
     */
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        log.info("Updating product: {}", id);

        Product product = findProductById(id);

        // Validar unicidad si se cambia el código o slug
        if (request.code() != null && !request.code().equals(product.getCode())) {
            if (productRepository.existsByCode(request.code())) {
                throw new IllegalArgumentException("Ya existe un producto con ese código");
            }
        }
        if (request.slug() != null && !request.slug().equals(product.getSlug())) {
            if (productRepository.existsBySlug(request.slug())) {
                throw new IllegalArgumentException("Ya existe un producto con ese slug");
            }
        }

        // Validar que la categoría existe si se cambia
        if (request.categoryId() != null && !categoryRepository.existsById(request.categoryId())) {
            throw new ResourceNotFoundException("Categoría no encontrada con ID: " + request.categoryId());
        }

        // Validar que la marca existe si se cambia
        if (request.brandId() != null && !brandRepository.existsById(request.brandId())) {
            throw new ResourceNotFoundException("Marca no encontrada con ID: " + request.brandId());
        }

        productMapper.updateEntityFromDto(request, product);
        Product updated = productRepository.save(product);

        log.info("Product updated successfully: {}", updated.getName());
        return productMapper.toResponse(updated);
    }

    /**
     * Eliminar producto (soft delete)
     */
    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product: {}", id);
        Product product = findProductById(id);
        product.setIsActive(false);
        productRepository.save(product);
        log.info("Product deleted successfully: {}", id);
    }

    /**
     * Alternar estado activo/inactivo
     */
    @Transactional
    public ProductResponse toggleProductStatus(Long id) {
        log.info("Toggling product status: {}", id);
        Product product = findProductById(id);
        product.setIsActive(!product.getIsActive());
        Product updated = productRepository.save(product);
        log.info("Product status toggled: {} -> {}", id, updated.getIsActive());
        return productMapper.toResponse(updated);
    }

    /**
     * Método auxiliar para buscar producto por ID
     */
    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
    }
}
