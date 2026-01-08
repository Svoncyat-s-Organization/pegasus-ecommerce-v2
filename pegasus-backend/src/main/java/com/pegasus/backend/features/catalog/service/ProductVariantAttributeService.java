package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.AssignVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.ProductVariantAttributeResponse;
import com.pegasus.backend.features.catalog.dto.SaveProductVariantAttributeRequest;
import com.pegasus.backend.features.catalog.entity.ProductVariantAttribute;
import com.pegasus.backend.features.catalog.entity.VariantAttribute;
import com.pegasus.backend.features.catalog.mapper.ProductVariantAttributeMapper;
import com.pegasus.backend.features.catalog.repository.ProductRepository;
import com.pegasus.backend.features.catalog.repository.ProductVariantAttributeRepository;
import com.pegasus.backend.features.catalog.repository.VariantAttributeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service para gestión de asignaciones de atributos de variantes a productos
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductVariantAttributeService {

    private final ProductVariantAttributeRepository assignmentRepository;
    private final ProductRepository productRepository;
    private final VariantAttributeRepository attributeRepository;
    private final ProductVariantAttributeMapper assignmentMapper;

    /**
     * Obtener todos los atributos asignados a un producto
     */
    public List<ProductVariantAttributeResponse> getAttributesByProductId(Long productId) {
        log.debug("Getting variant attribute assignments for product: {}", productId);
        
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + productId);
        }

        List<ProductVariantAttribute> assignments = assignmentRepository.findByProductIdWithAttributeDetails(productId);
        return assignmentMapper.toResponseList(assignments);
    }

    /**
     * Asignar un atributo de variante a un producto
     */
    @Transactional
    public ProductVariantAttributeResponse assignAttribute(Long productId, AssignVariantAttributeRequest request) {
        log.info("Assigning attribute {} to product: {}", request.getVariantAttributeId(), productId);

        validateProductExists(productId);
        validateAttributeExists(request.getVariantAttributeId());
        
        // Verificar que no exista la asignación
        if (assignmentRepository.existsByProductIdAndVariantAttributeId(productId, request.getVariantAttributeId())) {
            throw new BadRequestException("Este atributo ya está asignado al producto");
        }

        ProductVariantAttribute assignment = assignmentMapper.toEntity(request);
        assignment.setProductId(productId);
        
        // Si no se especifica posición, ponerlo al final
        if (assignment.getPosition() == null || assignment.getPosition() == 0) {
            long count = assignmentRepository.countByProductIdAndIsActiveTrue(productId);
            assignment.setPosition((int) count);
        }

        ProductVariantAttribute saved = assignmentRepository.save(assignment);
        final Long savedId = saved.getId();
        
        // Reload con relación para el response
        ProductVariantAttribute result = assignmentRepository.findByProductIdWithAttributeDetails(productId).stream()
            .filter(a -> a.getId().equals(savedId))
            .findFirst()
            .orElse(saved);
        
        log.info("Attribute assigned successfully with ID: {}", result.getId());
        return assignmentMapper.toResponse(result);
    }

    /**
     * Desasignar un atributo de un producto (soft delete)
     */
    @Transactional
    public void unassignAttribute(Long productId, Long assignmentId) {
        log.info("Unassigning attribute {} from product: {}", assignmentId, productId);

        ProductVariantAttribute assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Asignación no encontrada con ID: " + assignmentId));

        if (!assignment.getProductId().equals(productId)) {
            throw new BadRequestException("La asignación no pertenece a este producto");
        }

        assignment.setIsActive(false);
        assignmentRepository.save(assignment);

        log.info("Attribute unassigned successfully: {}", assignmentId);
    }

    /**
     * Actualizar opciones personalizadas de una asignación
     */
    @Transactional
    public ProductVariantAttributeResponse updateCustomOptions(Long productId, Long assignmentId, List<String> customOptions) {
        log.info("Updating custom options for assignment: {}", assignmentId);

        ProductVariantAttribute assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Asignación no encontrada con ID: " + assignmentId));

        if (!assignment.getProductId().equals(productId)) {
            throw new BadRequestException("La asignación no pertenece a este producto");
        }

        assignment.setCustomOptions(customOptions);
        ProductVariantAttribute saved = assignmentRepository.save(assignment);
        final Long savedId = saved.getId();
        
        // Reload con relación
        ProductVariantAttribute result = assignmentRepository.findByProductIdWithAttributeDetails(productId).stream()
            .filter(a -> a.getId().equals(savedId))
            .findFirst()
            .orElse(saved);

        log.info("Custom options updated successfully for assignment: {}", assignmentId);
        return assignmentMapper.toResponse(result);
    }

    /**
     * Guardar todas las asignaciones de un producto (batch operation)
     * Útil para guardar múltiples asignaciones de una vez desde el formulario
     */
    @Transactional
    public List<ProductVariantAttributeResponse> saveAllAssignments(Long productId, List<SaveProductVariantAttributeRequest> requests) {
        log.info("Saving {} attribute assignments for product: {}", requests.size(), productId);

        validateProductExists(productId);

        // Validar que todos los atributos existan
        Set<Long> attributeIds = new HashSet<>();
        for (SaveProductVariantAttributeRequest request : requests) {
            if (!attributeIds.add(request.getVariantAttributeId())) {
                throw new BadRequestException("No se puede asignar el mismo atributo más de una vez");
            }
        }
        validateAttributesExist(new ArrayList<>(attributeIds));

        // Obtener asignaciones existentes
        List<ProductVariantAttribute> existingAssignments = assignmentRepository.findByProductIdOrderByPositionAsc(productId);
        Set<Long> requestIds = new HashSet<>();
        
        List<ProductVariantAttribute> toSave = new ArrayList<>();
        
        for (int i = 0; i < requests.size(); i++) {
            SaveProductVariantAttributeRequest request = requests.get(i);
            ProductVariantAttribute assignment;
            
            if (request.getId() != null) {
                // Actualizar existente
                assignment = existingAssignments.stream()
                    .filter(a -> a.getId().equals(request.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Asignación no encontrada con ID: " + request.getId()));
                
                assignment.setVariantAttributeId(request.getVariantAttributeId());
                assignment.setCustomOptions(request.getCustomOptions());
                assignment.setPosition(i);
                assignment.setIsActive(true);
                requestIds.add(request.getId());
            } else {
                // Crear nuevo
                assignment = assignmentMapper.toEntity(request);
                assignment.setProductId(productId);
                assignment.setPosition(i);
            }
            
            toSave.add(assignment);
        }

        // Soft delete asignaciones que ya no están en la lista
        for (ProductVariantAttribute existing : existingAssignments) {
            if (!requestIds.contains(existing.getId())) {
                existing.setIsActive(false);
                toSave.add(existing);
            }
        }

        assignmentRepository.saveAll(toSave);
        
        // Reload con relaciones
        List<ProductVariantAttribute> result = assignmentRepository.findByProductIdWithAttributeDetails(productId);
        
        log.info("Saved {} attribute assignments for product: {}", result.size(), productId);
        return assignmentMapper.toResponseList(result);
    }

    /**
     * Reordenar las asignaciones de un producto
     */
    @Transactional
    public List<ProductVariantAttributeResponse> reorderAssignments(Long productId, List<Long> assignmentIds) {
        log.info("Reordering {} assignments for product: {}", assignmentIds.size(), productId);

        validateProductExists(productId);

        List<ProductVariantAttribute> assignments = assignmentRepository.findByProductIdAndIsActiveTrueOrderByPositionAsc(productId);
        
        // Crear mapa para acceso rápido
        Map<Long, ProductVariantAttribute> assignmentMap = new HashMap<>();
        for (ProductVariantAttribute a : assignments) {
            assignmentMap.put(a.getId(), a);
        }

        // Actualizar posiciones según el nuevo orden
        for (int i = 0; i < assignmentIds.size(); i++) {
            Long id = assignmentIds.get(i);
            ProductVariantAttribute assignment = assignmentMap.get(id);
            if (assignment != null) {
                assignment.setPosition(i);
            }
        }

        assignmentRepository.saveAll(assignments);
        
        // Reload con relaciones
        List<ProductVariantAttribute> result = assignmentRepository.findByProductIdWithAttributeDetails(productId);
        
        log.info("Assignments reordered successfully for product: {}", productId);
        return assignmentMapper.toResponseList(result);
    }

    // ==================== Private Helper Methods ====================

    private void validateProductExists(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + productId);
        }
    }

    private void validateAttributeExists(Long attributeId) {
        if (!attributeRepository.existsById(attributeId)) {
            throw new ResourceNotFoundException("Atributo no encontrado con ID: " + attributeId);
        }
    }

    private void validateAttributesExist(List<Long> attributeIds) {
        List<VariantAttribute> found = attributeRepository.findByIdInAndIsActiveTrue(attributeIds);
        if (found.size() != attributeIds.size()) {
            throw new BadRequestException("Uno o más atributos no existen o están inactivos");
        }
    }
}
