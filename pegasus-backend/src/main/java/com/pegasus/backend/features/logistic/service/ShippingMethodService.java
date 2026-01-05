package com.pegasus.backend.features.logistic.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.logistic.dto.CreateShippingMethodRequest;
import com.pegasus.backend.features.logistic.dto.ShippingMethodResponse;
import com.pegasus.backend.features.logistic.dto.UpdateShippingMethodRequest;
import com.pegasus.backend.features.logistic.entity.ShippingMethod;
import com.pegasus.backend.features.logistic.mapper.ShippingMethodMapper;
import com.pegasus.backend.features.logistic.repository.ShippingMethodRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ShippingMethodService {

    private final ShippingMethodRepository shippingMethodRepository;
    private final ShippingMethodMapper shippingMethodMapper;

    public PageResponse<ShippingMethodResponse> getAllShippingMethods(String search, Boolean isActive,
            Pageable pageable) {
        log.debug("Getting all shipping methods with search: {}, isActive: {}", search, isActive);

        Page<ShippingMethod> page;

        if (search != null && !search.isBlank()) {
            page = shippingMethodRepository.searchShippingMethods(search.trim(), pageable);
        } else if (isActive != null) {
            page = shippingMethodRepository.findByIsActive(isActive, pageable);
        } else {
            page = shippingMethodRepository.findAll(pageable);
        }

        List<ShippingMethodResponse> content = page.getContent().stream()
                .map(shippingMethodMapper::toResponse)
                .toList();

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    public ShippingMethodResponse getShippingMethodById(Long id) {
        log.debug("Getting shipping method by id: {}", id);

        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de envío no encontrado con ID: " + id));

        return shippingMethodMapper.toResponse(shippingMethod);
    }

    @Transactional
    public ShippingMethodResponse createShippingMethod(CreateShippingMethodRequest request) {
        log.info("Creating shipping method: {}", request.getName());

        ShippingMethod shippingMethod = shippingMethodMapper.toEntity(request);
        ShippingMethod saved = shippingMethodRepository.save(shippingMethod);

        log.info("Shipping method created successfully: {}", saved.getName());
        return shippingMethodMapper.toResponse(saved);
    }

    @Transactional
    public ShippingMethodResponse updateShippingMethod(Long id, UpdateShippingMethodRequest request) {
        log.info("Updating shipping method with id: {}", id);

        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de envío no encontrado con ID: " + id));

        shippingMethodMapper.updateEntityFromRequest(request, shippingMethod);
        ShippingMethod updated = shippingMethodRepository.save(shippingMethod);

        log.info("Shipping method updated successfully: {}", updated.getName());
        return shippingMethodMapper.toResponse(updated);
    }

    @Transactional
    public void deleteShippingMethod(Long id) {
        log.info("Deleting shipping method with id: {}", id);

        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de envío no encontrado con ID: " + id));

        shippingMethod.setIsActive(false);
        shippingMethodRepository.save(shippingMethod);

        log.info("Shipping method deleted successfully: {}", shippingMethod.getName());
    }

    /**
     * Obtiene todos los métodos de envío activos (para storefront)
     */
    public List<ShippingMethodResponse> getActiveShippingMethods() {
        log.debug("Getting all active shipping methods for storefront");
        
        List<ShippingMethod> activeMethods = shippingMethodRepository.findByIsActiveTrue();
        
        return activeMethods.stream()
                .map(shippingMethodMapper::toResponse)
                .toList();
    }
}
