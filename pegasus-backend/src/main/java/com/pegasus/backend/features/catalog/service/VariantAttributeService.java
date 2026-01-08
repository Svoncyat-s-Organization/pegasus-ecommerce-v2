package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.CreateVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.UpdateVariantAttributeRequest;
import com.pegasus.backend.features.catalog.dto.VariantAttributeResponse;
import com.pegasus.backend.features.catalog.entity.VariantAttribute;
import com.pegasus.backend.features.catalog.mapper.VariantAttributeMapper;
import com.pegasus.backend.features.catalog.repository.VariantAttributeRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service para gestión del catálogo global de atributos de variantes
 * Estos atributos son reutilizables en cualquier producto
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class VariantAttributeService {

    private final VariantAttributeRepository attributeRepository;
    private final VariantAttributeMapper attributeMapper;

    /**
     * Obtener todos los atributos activos (para selects)
     */
    public List<VariantAttributeResponse> getAllActiveAttributes() {
        log.debug("Getting all active variant attributes");
        List<VariantAttribute> attributes = attributeRepository.findByIsActiveTrueOrderByDisplayNameAsc();
        return attributeMapper.toResponseList(attributes);
    }

    /**
     * Obtener atributos con paginación y búsqueda
     */
    public PageResponse<VariantAttributeResponse> getAttributes(String search, Pageable pageable) {
        log.debug("Getting variant attributes with search: {}", search);
        
        Page<VariantAttribute> page;
        if (search != null && !search.isBlank()) {
            page = attributeRepository.searchAttributes(search.trim(), pageable);
        } else {
            page = attributeRepository.findByIsActiveTrue(pageable);
        }

        List<VariantAttributeResponse> content = attributeMapper.toResponseList(page.getContent());
        
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
     * Obtener un atributo por ID
     */
    public VariantAttributeResponse getAttributeById(Long id) {
        log.debug("Getting variant attribute by ID: {}", id);
        VariantAttribute attribute = findAttributeById(id);
        return attributeMapper.toResponse(attribute);
    }

    /**
     * Obtener un atributo por nombre
     */
    public VariantAttributeResponse getAttributeByName(String name) {
        log.debug("Getting variant attribute by name: {}", name);
        VariantAttribute attribute = attributeRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("Atributo no encontrado con nombre: " + name));
        return attributeMapper.toResponse(attribute);
    }

    /**
     * Crear un nuevo atributo global
     */
    @Transactional
    public VariantAttributeResponse createAttribute(CreateVariantAttributeRequest request) {
        log.info("Creating variant attribute: {}", request.getName());

        // Validar nombre único
        if (attributeRepository.existsByName(request.getName())) {
            throw new BadRequestException("Ya existe un atributo con el nombre '" + request.getName() + "'");
        }

        // Validar que tenga opciones
        if (request.getOptions() == null || request.getOptions().isEmpty()) {
            throw new BadRequestException("El atributo debe tener al menos una opción");
        }

        VariantAttribute attribute = attributeMapper.toEntity(request);
        VariantAttribute saved = attributeRepository.save(attribute);
        
        log.info("Variant attribute created successfully with ID: {}", saved.getId());
        return attributeMapper.toResponse(saved);
    }

    /**
     * Actualizar un atributo existente
     */
    @Transactional
    public VariantAttributeResponse updateAttribute(Long id, UpdateVariantAttributeRequest request) {
        log.info("Updating variant attribute: {}", id);

        VariantAttribute attribute = findAttributeById(id);

        // Validar nombre único (excluyendo el actual)
        if (request.getName() != null && !request.getName().equals(attribute.getName())) {
            if (attributeRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new BadRequestException("Ya existe un atributo con el nombre '" + request.getName() + "'");
            }
        }

        // Validar que tenga opciones
        if (request.getOptions() != null && request.getOptions().isEmpty()) {
            throw new BadRequestException("El atributo debe tener al menos una opción");
        }

        attributeMapper.updateEntity(request, attribute);
        VariantAttribute saved = attributeRepository.save(attribute);
        
        log.info("Variant attribute updated successfully: {}", saved.getId());
        return attributeMapper.toResponse(saved);
    }

    /**
     * Eliminar un atributo (soft delete)
     */
    @Transactional
    public void deleteAttribute(Long id) {
        log.info("Deleting variant attribute: {}", id);

        VariantAttribute attribute = findAttributeById(id);
        attribute.setIsActive(false);
        attributeRepository.save(attribute);

        log.info("Variant attribute deleted (soft) successfully: {}", id);
    }

    /**
     * Obtener atributos por tipo
     */
    public List<VariantAttributeResponse> getAttributesByType(VariantAttribute.AttributeType type) {
        log.debug("Getting variant attributes by type: {}", type);
        List<VariantAttribute> attributes = attributeRepository.findByAttributeTypeAndIsActiveTrue(type);
        return attributeMapper.toResponseList(attributes);
    }

    /**
     * Obtener múltiples atributos por IDs
     */
    public List<VariantAttributeResponse> getAttributesByIds(List<Long> ids) {
        log.debug("Getting variant attributes by IDs: {}", ids);
        List<VariantAttribute> attributes = attributeRepository.findByIdInAndIsActiveTrue(ids);
        return attributeMapper.toResponseList(attributes);
    }

    // ==================== Private Helper Methods ====================

    private VariantAttribute findAttributeById(Long id) {
        return attributeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Atributo no encontrado con ID: " + id));
    }
}
