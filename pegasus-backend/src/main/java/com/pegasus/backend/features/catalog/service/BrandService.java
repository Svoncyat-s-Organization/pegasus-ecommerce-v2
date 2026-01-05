package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.BrandResponse;
import com.pegasus.backend.features.catalog.dto.CreateBrandRequest;
import com.pegasus.backend.features.catalog.dto.UpdateBrandRequest;
import com.pegasus.backend.features.catalog.entity.Brand;
import com.pegasus.backend.features.catalog.mapper.BrandMapper;
import com.pegasus.backend.features.catalog.repository.BrandRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service para gestión de marcas
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    /**
     * Obtener todas las marcas con paginación y búsqueda opcional
     */
    public PageResponse<BrandResponse> getAllBrands(String search, Pageable pageable) {
        log.debug("Getting brands with search: {}, page: {}", search, pageable.getPageNumber());

        Page<Brand> page = (search != null && !search.isBlank())
                ? brandRepository.searchBrands(search.trim(), pageable)
                : brandRepository.findAll(pageable);

        List<BrandResponse> content = brandMapper.toResponseList(page.getContent());

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
     * Obtener marca por ID
     */
    public BrandResponse getBrandById(Long id) {
        log.debug("Getting brand by id: {}", id);
        Brand brand = findBrandById(id);
        return brandMapper.toResponse(brand);
    }

    /**
     * Crear nueva marca
     */
    @Transactional
    public BrandResponse createBrand(CreateBrandRequest request) {
        log.info("Creating brand: {}", request.name());

        // Validar unicidad
        if (brandRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Ya existe una marca con ese nombre");
        }
        if (brandRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Ya existe una marca con ese slug");
        }

        Brand brand = brandMapper.toEntity(request);
        Brand saved = brandRepository.save(brand);

        log.info("Brand created successfully: {}", saved.getName());
        return brandMapper.toResponse(saved);
    }

    /**
     * Actualizar marca existente
     */
    @Transactional
    public BrandResponse updateBrand(Long id, UpdateBrandRequest request) {
        log.info("Updating brand: {}", id);

        Brand brand = findBrandById(id);

        // Validar unicidad si se cambia el nombre o slug
        if (request.name() != null && !request.name().equals(brand.getName())) {
            if (brandRepository.existsByName(request.name())) {
                throw new IllegalArgumentException("Ya existe una marca con ese nombre");
            }
        }
        if (request.slug() != null && !request.slug().equals(brand.getSlug())) {
            if (brandRepository.existsBySlug(request.slug())) {
                throw new IllegalArgumentException("Ya existe una marca con ese slug");
            }
        }

        brandMapper.updateEntityFromDto(request, brand);
        Brand updated = brandRepository.save(brand);

        log.info("Brand updated successfully: {}", updated.getName());
        return brandMapper.toResponse(updated);
    }

    /**
     * Eliminar marca (soft delete)
     */
    @Transactional
    public void deleteBrand(Long id) {
        log.info("Deleting brand: {}", id);
        Brand brand = findBrandById(id);
        brand.setIsActive(false);
        brandRepository.save(brand);
        log.info("Brand deleted successfully: {}", id);
    }

    /**
     * Alternar estado activo/inactivo
     */
    @Transactional
    public BrandResponse toggleBrandStatus(Long id) {
        log.info("Toggling brand status: {}", id);
        Brand brand = findBrandById(id);
        brand.setIsActive(!brand.getIsActive());
        Brand updated = brandRepository.save(brand);
        log.info("Brand status toggled: {} -> {}", id, updated.getIsActive());
        return brandMapper.toResponse(updated);
    }

    /**
     * Método auxiliar para buscar marca por ID
     */
    private Brand findBrandById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada con ID: " + id));
    }
}
