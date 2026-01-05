package com.pegasus.backend.features.inventory.service;

import com.pegasus.backend.features.inventory.dto.CreateWarehouseRequest;
import com.pegasus.backend.features.inventory.dto.UpdateWarehouseRequest;
import com.pegasus.backend.features.inventory.dto.WarehouseResponse;
import com.pegasus.backend.features.inventory.entity.Warehouse;
import com.pegasus.backend.features.inventory.mapper.WarehouseMapper;
import com.pegasus.backend.features.inventory.repository.WarehouseRepository;
import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para gestión de almacenes
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;

    /**
     * Busca almacenes por nombre o código
     */
    public Page<WarehouseResponse> searchWarehouses(String query, Boolean isActive, Pageable pageable) {
        log.debug("Searching warehouses with query: {}, isActive: {}", query, isActive);
        
        Page<Warehouse> warehouses = warehouseRepository.searchWarehouses(query, isActive, pageable);
        return warehouses.map(warehouseMapper::toResponse);
    }

    /**
     * Obtiene todos los almacenes activos
     */
    public List<WarehouseResponse> getActiveWarehouses() {
        log.debug("Getting all active warehouses");
        
        List<Warehouse> warehouses = warehouseRepository.findByIsActiveTrue();
        return warehouses.stream()
                .map(warehouseMapper::toResponse)
                .toList();
    }

    /**
     * Obtiene un almacén por ID
     */
    public WarehouseResponse getWarehouseById(Long id) {
        log.debug("Getting warehouse by id: {}", id);
        
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + id));
        
        return warehouseMapper.toResponse(warehouse);
    }

    /**
     * Obtiene un almacén por código
     */
    public WarehouseResponse getWarehouseByCode(String code) {
        log.debug("Getting warehouse by code: {}", code);
        
        Warehouse warehouse = warehouseRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con código: " + code));
        
        return warehouseMapper.toResponse(warehouse);
    }

    /**
     * Crea un nuevo almacén
     */
    @Transactional
    public WarehouseResponse createWarehouse(CreateWarehouseRequest request) {
        log.info("Creating warehouse with code: {}", request.code());
        
        // Validar código único
        if (warehouseRepository.existsByCode(request.code())) {
            throw new BadRequestException("Ya existe un almacén con el código: " + request.code());
        }
        
        Warehouse warehouse = warehouseMapper.toEntity(request);
        warehouse.setIsActive(true); // Set default value
        warehouse = warehouseRepository.save(warehouse);
        
        log.info("Warehouse created with id: {}", warehouse.getId());
        return warehouseMapper.toResponse(warehouse);
    }

    /**
     * Actualiza un almacén existente
     */
    @Transactional
    public WarehouseResponse updateWarehouse(Long id, UpdateWarehouseRequest request) {
        log.info("Updating warehouse with id: {}", id);
        
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + id));
        
        warehouseMapper.updateEntity(request, warehouse);
        warehouse = warehouseRepository.save(warehouse);
        
        log.info("Warehouse updated with id: {}", warehouse.getId());
        return warehouseMapper.toResponse(warehouse);
    }

    /**
     * Activa o desactiva un almacén
     */
    @Transactional
    public WarehouseResponse toggleWarehouseStatus(Long id) {
        log.info("Toggling warehouse status with id: {}", id);
        
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + id));
        
        warehouse.setIsActive(!warehouse.getIsActive());
        warehouse = warehouseRepository.save(warehouse);
        
        log.info("Warehouse status toggled to: {} for id: {}", warehouse.getIsActive(), warehouse.getId());
        return warehouseMapper.toResponse(warehouse);
    }

    /**
     * Elimina un almacén (soft delete)
     */
    @Transactional
    public void deleteWarehouse(Long id) {
        log.info("Deleting warehouse with id: {}", id);
        
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + id));
        
        // Verificar que no tenga stock asociado antes de eliminar
        if (warehouseRepository.hasStock(id)) {
            throw new BadRequestException("No se puede eliminar el almacén porque tiene stock asociado");
        }
        
        warehouse.setIsActive(false);
        warehouseRepository.save(warehouse);
        
        log.info("Warehouse deleted (soft) with id: {}", id);
    }
}
