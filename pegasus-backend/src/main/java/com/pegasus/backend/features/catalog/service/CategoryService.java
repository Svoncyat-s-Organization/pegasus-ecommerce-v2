package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.CategoryResponse;
import com.pegasus.backend.features.catalog.dto.CreateCategoryRequest;
import com.pegasus.backend.features.catalog.dto.UpdateCategoryRequest;
import com.pegasus.backend.features.catalog.entity.Category;
import com.pegasus.backend.features.catalog.mapper.CategoryMapper;
import com.pegasus.backend.features.catalog.repository.CategoryRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service para gestión de categorías
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    /**
     * Obtener todas las categorías con paginación y búsqueda opcional
     */
    public PageResponse<CategoryResponse> getAllCategories(String search, Pageable pageable) {
        log.debug("Getting categories with search: {}, page: {}", search, pageable.getPageNumber());

        Page<Category> page = (search != null && !search.isBlank())
                ? categoryRepository.searchCategories(search.trim(), pageable)
                : categoryRepository.findAll(pageable);

        List<CategoryResponse> content = categoryMapper.toResponseList(page.getContent());

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
     * Obtener categoría por ID
     */
    public CategoryResponse getCategoryById(Long id) {
        log.debug("Getting category by id: {}", id);
        Category category = findCategoryById(id);
        return categoryMapper.toResponse(category);
    }

    /**
     * Obtener categorías raíz (sin padre)
     */
    public List<CategoryResponse> getRootCategories() {
        log.debug("Getting root categories");
        List<Category> categories = categoryRepository.findByParentIdIsNull();
        return categoryMapper.toResponseList(categories);
    }

    /**
     * Obtener subcategorías de una categoría padre
     */
    public List<CategoryResponse> getSubcategories(Long parentId) {
        log.debug("Getting subcategories of parent: {}", parentId);
        List<Category> categories = categoryRepository.findByParentId(parentId);
        return categoryMapper.toResponseList(categories);
    }

    /**
     * Crear nueva categoría
     */
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        log.info("Creating category: {}", request.name());

        // Validar unicidad
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Ya existe una categoría con ese slug");
        }

        // Validar que el padre existe si se especifica
        if (request.parentId() != null) {
            findCategoryById(request.parentId());
        }

        Category category = categoryMapper.toEntity(request);
        Category saved = categoryRepository.save(category);

        log.info("Category created successfully: {}", saved.getName());
        return categoryMapper.toResponse(saved);
    }

    /**
     * Actualizar categoría existente
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        log.info("Updating category: {}", id);

        Category category = findCategoryById(id);

        // Validar unicidad si se cambia el slug
        if (request.slug() != null && !request.slug().equals(category.getSlug())) {
            if (categoryRepository.existsBySlug(request.slug())) {
                throw new IllegalArgumentException("Ya existe una categoría con ese slug");
            }
        }

        // Validar que el padre existe si se especifica
        if (request.parentId() != null) {
            if (request.parentId().equals(id)) {
                throw new IllegalArgumentException("Una categoría no puede ser su propio padre");
            }
            findCategoryById(request.parentId());
        }

        categoryMapper.updateEntityFromDto(request, category);
        Category updated = categoryRepository.save(category);

        log.info("Category updated successfully: {}", updated.getName());
        return categoryMapper.toResponse(updated);
    }

    /**
     * Eliminar categoría (soft delete)
     */
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category: {}", id);
        Category category = findCategoryById(id);

        // Verificar si tiene subcategorías
        List<Category> subcategories = categoryRepository.findByParentId(id);
        if (!subcategories.isEmpty()) {
            throw new IllegalStateException("No se puede eliminar una categoría con subcategorías");
        }

        category.setIsActive(false);
        categoryRepository.save(category);
        log.info("Category deleted successfully: {}", id);
    }

    /**
     * Alternar estado activo/inactivo
     */
    @Transactional
    public CategoryResponse toggleCategoryStatus(Long id) {
        log.info("Toggling category status: {}", id);
        Category category = findCategoryById(id);
        category.setIsActive(!category.getIsActive());
        Category updated = categoryRepository.save(category);
        log.info("Category status toggled: {} -> {}", id, updated.getIsActive());
        return categoryMapper.toResponse(updated);
    }

    /**
     * Método auxiliar para buscar categoría por ID
     */
    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
    }
}
