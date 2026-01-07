package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.CategoryResponse;
import com.pegasus.backend.features.catalog.dto.CreateCategoryRequest;
import com.pegasus.backend.features.catalog.dto.UpdateCategoryRequest;
import com.pegasus.backend.features.catalog.entity.Category;
import com.pegasus.backend.features.catalog.mapper.CategoryMapper;
import com.pegasus.backend.features.catalog.repository.CategoryRepository;
import com.pegasus.backend.features.catalog.repository.ProductRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
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
    private final ProductRepository productRepository;

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
     * Obtener todas las categorías en estructura jerárquica (árbol)
     */
    public List<CategoryResponse> getCategoriesTree() {
        log.debug("Getting categories tree");
        
        // Obtener todas las categorías
        List<Category> allCategories = categoryRepository.findAll();
        List<CategoryResponse> allResponses = categoryMapper.toResponseList(allCategories);
        
        // Construir el árbol
        return buildCategoryTree(allResponses);
    }
    
    /**
     * Construir estructura jerárquica de categorías
     */
    private List<CategoryResponse> buildCategoryTree(List<CategoryResponse> categories) {
        // Crear un mapa para acceso rápido
        var categoryMap = new java.util.HashMap<Long, CategoryResponse>();
        var childrenMap = new java.util.HashMap<Long, java.util.ArrayList<CategoryResponse>>();
        
        // Inicializar mapas
        for (CategoryResponse category : categories) {
            categoryMap.put(category.id(), category);
            childrenMap.put(category.id(), new java.util.ArrayList<>());
        }
        
        // Organizar categorías por parentId
        var rootCategories = new java.util.ArrayList<CategoryResponse>();
        
        for (CategoryResponse category : categories) {
            if (category.parentId() == null) {
                // Es una categoría raíz
                rootCategories.add(category);
            } else {
                // Es una subcategoría, agregarla a su padre
                childrenMap.get(category.parentId()).add(category);
            }
        }
        
        // Reconstruir las categorías con sus hijos
        return rootCategories.stream()
            .map(root -> attachChildren(root, childrenMap))
            .toList();
    }
    
    /**
     * Adjuntar recursivamente los hijos a una categoría
     */
    private CategoryResponse attachChildren(
        CategoryResponse category, 
        java.util.HashMap<Long, java.util.ArrayList<CategoryResponse>> childrenMap
    ) {
        var children = childrenMap.get(category.id());
        
        if (children == null || children.isEmpty()) {
            return category;
        }
        
        // Recursivamente adjuntar hijos a cada subcategoría
        var processedChildren = children.stream()
            .map(child -> attachChildren(child, childrenMap))
            .toList();
        
        return new CategoryResponse(
            category.id(),
            category.name(),
            category.slug(),
            category.description(),
            category.imageUrl(),
            category.parentId(),
            category.parentName(),
            category.isActive(),
            category.createdAt(),
            category.updatedAt(),
            processedChildren
        );
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
     * Eliminar categoría (eliminación física - permanente)
     */
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category physically: {}", id);
        Category category = findCategoryById(id);

        // Verificar si tiene productos asociados
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new IllegalStateException(
                String.format("No se puede eliminar la categoría porque tiene %d producto(s) asociado(s). " +
                    "Primero debes eliminar o reasignar los productos.", productCount)
            );
        }

        // Verificar si tiene subcategorías
        List<Category> subcategories = categoryRepository.findByParentId(id);
        if (!subcategories.isEmpty()) {
            throw new IllegalStateException(
                String.format("No se puede eliminar la categoría porque tiene %d subcategoría(s). " +
                    "Primero debes eliminar las subcategorías.", subcategories.size())
            );
        }

        // Eliminación física permanente
        categoryRepository.deleteById(id);
        log.info("Category deleted permanently: {}", id);
    }

    /**
     * Alternar estado activo/inactivo (soft delete reversible)
     */
    @Transactional
    public CategoryResponse toggleCategoryStatus(Long id) {
        log.info("Toggling category status: {}", id);
        Category category = findCategoryById(id);
        
        // Si se va a desactivar, verificar que no tenga subcategorías activas
        if (category.getIsActive()) {
            List<Category> activeSubcategories = categoryRepository.findByParentId(id)
                .stream()
                .filter(Category::getIsActive)
                .toList();
            
            if (!activeSubcategories.isEmpty()) {
                throw new IllegalStateException(
                    String.format("No se puede desactivar la categoría porque tiene %d subcategoría(s) activa(s). " +
                        "Primero desactiva las subcategorías.", activeSubcategories.size())
                );
            }
        }
        
        category.setIsActive(!category.getIsActive());
        Category updated = categoryRepository.save(category);
        log.info("Category status toggled: {} -> {}", id, updated.getIsActive());
        return categoryMapper.toResponse(updated);
    }

    /**
     * Generar slug a partir de un nombre
     */
    public String generateSlug(String name) {
        if (name == null || name.isBlank()) {
            return "";
        }
        
        // Normalizar y remover acentos
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        
        // Convertir a minúsculas, reemplazar espacios y caracteres especiales por guiones
        return normalized.toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-+|-+$", ""); // Remover guiones al inicio y final
    }

    /**
     * Método auxiliar para buscar categoría por ID
     */
    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
    }
}
