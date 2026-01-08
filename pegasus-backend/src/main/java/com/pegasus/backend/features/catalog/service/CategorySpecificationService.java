package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.CategorySpecificationResponse;
import com.pegasus.backend.features.catalog.dto.CreateCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.dto.SaveCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.dto.UpdateCategorySpecificationRequest;
import com.pegasus.backend.features.catalog.entity.Category;
import com.pegasus.backend.features.catalog.entity.CategorySpecification;
import com.pegasus.backend.features.catalog.mapper.CategorySpecificationMapper;
import com.pegasus.backend.features.catalog.repository.CategoryRepository;
import com.pegasus.backend.features.catalog.repository.CategorySpecificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service para gestión de especificaciones de categoría
 * Maneja la definición de campos de especificación a nivel de categoría con soporte de herencia
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategorySpecificationService {

    private final CategorySpecificationRepository specificationRepository;
    private final CategoryRepository categoryRepository;
    private final CategorySpecificationMapper specificationMapper;

    /**
     * Obtener especificaciones de una categoría (solo propias, sin herencia)
     */
    public List<CategorySpecificationResponse> getSpecificationsByCategoryId(Long categoryId) {
        log.debug("Getting specifications for category: {}", categoryId);
        
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Categoría no encontrada con ID: " + categoryId);
        }

        List<CategorySpecification> specifications = specificationRepository.findByCategoryIdOrderByPositionAsc(categoryId);
        return specificationMapper.toResponseList(specifications);
    }

    /**
     * Obtener especificaciones incluyendo las heredadas de categorías padre
     * @param categoryId ID de la categoría
     * @return Lista de especificaciones (propias + heredadas)
     */
    public List<CategorySpecificationResponse> getSpecificationsWithInheritance(Long categoryId) {
        log.debug("Getting specifications with inheritance for category: {}", categoryId);
        
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + categoryId));

        // Obtener la jerarquía de categorías (desde raíz hasta la actual)
        List<Long> categoryHierarchy = getCategoryHierarchy(category);
        
        // Obtener especificaciones de toda la jerarquía
        List<CategorySpecification> allSpecs = specificationRepository
            .findByCategoryIdInAndIsActiveTrue(categoryHierarchy);
        
        // Filtrar duplicados (las especificaciones de categorías hijas sobreescriben las de padres)
        List<CategorySpecification> mergedSpecs = mergeSpecifications(allSpecs, categoryHierarchy);
        
        return specificationMapper.toResponseList(mergedSpecs);
    }

    /**
     * Obtener una especificación por ID
     */
    public CategorySpecificationResponse getSpecificationById(Long id) {
        log.debug("Getting specification by ID: {}", id);
        CategorySpecification specification = findSpecificationById(id);
        return specificationMapper.toResponse(specification);
    }

    /**
     * Crear una nueva especificación para una categoría
     */
    @Transactional
    public CategorySpecificationResponse createSpecification(CreateCategorySpecificationRequest request) {
        log.info("Creating specification '{}' for category: {}", request.getName(), request.getCategoryId());

        validateCategoryExists(request.getCategoryId());
        validateUniqueName(request.getCategoryId(), request.getName(), null);
        validateSpecType(request);

        CategorySpecification specification = specificationMapper.toEntity(request);
        
        // Si no se especifica posición, ponerlo al final
        if (specification.getPosition() == null || specification.getPosition() == 0) {
            long count = specificationRepository.countByCategoryIdAndIsActiveTrue(request.getCategoryId());
            specification.setPosition((int) count);
        }

        CategorySpecification saved = specificationRepository.save(specification);
        log.info("Specification created successfully with ID: {}", saved.getId());

        return specificationMapper.toResponse(saved);
    }

    /**
     * Actualizar una especificación existente
     */
    @Transactional
    public CategorySpecificationResponse updateSpecification(Long id, UpdateCategorySpecificationRequest request) {
        log.info("Updating specification: {}", id);

        CategorySpecification specification = findSpecificationById(id);
        
        // Validar nombre único (excluyendo la especificación actual)
        if (request.getName() != null && !request.getName().equals(specification.getName())) {
            validateUniqueName(specification.getCategoryId(), request.getName(), id);
        }

        specificationMapper.updateEntity(request, specification);
        
        CategorySpecification saved = specificationRepository.save(specification);
        log.info("Specification updated successfully: {}", saved.getId());

        return specificationMapper.toResponse(saved);
    }

    /**
     * Eliminar una especificación (soft delete)
     */
    @Transactional
    public void deleteSpecification(Long id) {
        log.info("Deleting specification: {}", id);

        CategorySpecification specification = findSpecificationById(id);
        specification.setIsActive(false);
        specificationRepository.save(specification);

        log.info("Specification deleted (soft) successfully: {}", id);
    }

    /**
     * Guardar todas las especificaciones de una categoría (batch operation)
     * Útil para guardar múltiples especificaciones de una vez desde el formulario
     */
    @Transactional
    public List<CategorySpecificationResponse> saveAllSpecifications(Long categoryId, List<SaveCategorySpecificationRequest> requests) {
        log.info("Saving {} specifications for category: {}", requests.size(), categoryId);

        validateCategoryExists(categoryId);

        // Obtener especificaciones existentes
        List<CategorySpecification> existingSpecs = specificationRepository.findByCategoryIdOrderByPositionAsc(categoryId);
        Set<Long> requestIds = new HashSet<>();
        
        List<CategorySpecification> toSave = new ArrayList<>();
        
        for (int i = 0; i < requests.size(); i++) {
            SaveCategorySpecificationRequest request = requests.get(i);
            CategorySpecification spec;
            
            if (request.getId() != null) {
                // Actualizar existente
                spec = existingSpecs.stream()
                    .filter(s -> s.getId().equals(request.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Especificación no encontrada con ID: " + request.getId()));
                
                spec.setName(request.getName());
                spec.setDisplayName(request.getDisplayName());
                spec.setSpecType(request.getSpecType());
                spec.setUnit(request.getUnit());
                spec.setOptions(request.getOptions());
                spec.setIsRequired(request.getIsRequired() != null ? request.getIsRequired() : false);
                spec.setPosition(i);
                requestIds.add(request.getId());
            } else {
                // Crear nuevo
                spec = specificationMapper.toEntity(request);
                spec.setCategoryId(categoryId);
                spec.setPosition(i);
            }
            
            toSave.add(spec);
        }

        // Soft delete especificaciones que ya no están en la lista
        for (CategorySpecification existing : existingSpecs) {
            if (!requestIds.contains(existing.getId())) {
                existing.setIsActive(false);
                toSave.add(existing);
            }
        }

        List<CategorySpecification> saved = specificationRepository.saveAll(toSave);
        
        // Filtrar solo las activas para retornar
        List<CategorySpecification> activeSpecs = saved.stream()
            .filter(CategorySpecification::getIsActive)
            .sorted((a, b) -> a.getPosition().compareTo(b.getPosition()))
            .toList();
        
        log.info("Saved {} specifications for category: {}", activeSpecs.size(), categoryId);

        return specificationMapper.toResponseList(activeSpecs);
    }

    // ==================== Private Helper Methods ====================

    private CategorySpecification findSpecificationById(Long id) {
        return specificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Especificación no encontrada con ID: " + id));
    }

    private void validateCategoryExists(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Categoría no encontrada con ID: " + categoryId);
        }
    }

    private void validateUniqueName(Long categoryId, String name, Long excludeId) {
        boolean exists = excludeId == null
            ? specificationRepository.existsByCategoryIdAndName(categoryId, name)
            : specificationRepository.existsByCategoryIdAndNameAndIdNot(categoryId, name, excludeId);
        
        if (exists) {
            throw new BadRequestException("Ya existe una especificación con el nombre '" + name + "' para esta categoría");
        }
    }

    private void validateSpecType(CreateCategorySpecificationRequest request) {
        // Si el tipo es SELECT, debe tener options
        if (request.getSpecType() == CategorySpecification.SpecType.SELECT) {
            if (request.getOptions() == null || request.getOptions().isEmpty()) {
                throw new BadRequestException("Las especificaciones de tipo SELECT requieren opciones");
            }
        }
        // Si el tipo es NUMBER, puede tener unit
        // TEXT y BOOLEAN no requieren validación adicional
    }

    /**
     * Obtener la jerarquía de categorías desde la raíz hasta la categoría actual
     */
    private List<Long> getCategoryHierarchy(Category category) {
        List<Long> hierarchy = new ArrayList<>();
        Category current = category;
        
        while (current != null) {
            hierarchy.add(0, current.getId()); // Agregar al inicio para mantener orden raíz -> hijo
            if (current.getParentId() != null) {
                current = categoryRepository.findById(current.getParentId()).orElse(null);
            } else {
                current = null;
            }
        }
        
        return hierarchy;
    }

    /**
     * Merge especificaciones de la jerarquía.
     * Las especificaciones de categorías hijas sobreescriben las de categorías padre con el mismo nombre.
     */
    private List<CategorySpecification> mergeSpecifications(List<CategorySpecification> allSpecs, List<Long> hierarchy) {
        // Usar un Map para sobreescribir por nombre, manteniendo las de categorías más específicas
        java.util.LinkedHashMap<String, CategorySpecification> mergedMap = new java.util.LinkedHashMap<>();
        
        // Procesar en orden de jerarquía (raíz primero, luego hijos)
        for (Long categoryId : hierarchy) {
            for (CategorySpecification spec : allSpecs) {
                if (spec.getCategoryId().equals(categoryId)) {
                    mergedMap.put(spec.getName(), spec);
                }
            }
        }
        
        return new ArrayList<>(mergedMap.values());
    }
}
