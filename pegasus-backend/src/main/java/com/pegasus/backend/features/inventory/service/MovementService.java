package com.pegasus.backend.features.inventory.service;

import com.pegasus.backend.features.inventory.dto.MovementResponse;
import com.pegasus.backend.features.inventory.entity.Movement;
import com.pegasus.backend.features.inventory.entity.Stock;
import com.pegasus.backend.features.inventory.entity.Warehouse;
import com.pegasus.backend.features.inventory.mapper.MovementMapper;
import com.pegasus.backend.features.inventory.repository.MovementRepository;
import com.pegasus.backend.features.inventory.repository.StockRepository;
import com.pegasus.backend.features.inventory.repository.WarehouseRepository;
import com.pegasus.backend.features.catalog.entity.Variant;
import com.pegasus.backend.features.catalog.repository.VariantRepository;
import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.features.user.repository.UserRepository;
import com.pegasus.backend.shared.enums.OperationType;
import com.pegasus.backend.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Servicio para registro de movimientos de inventario
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MovementService {

    private final MovementRepository movementRepository;
    private final StockRepository stockRepository;
    private final WarehouseRepository warehouseRepository;
    private final VariantRepository variantRepository;
    private final UserRepository userRepository;
    private final MovementMapper movementMapper;

    /**
     * Busca movimientos con filtros
     */
    public Page<MovementResponse> searchMovements(
            Long warehouseId,
            Long variantId,
            OperationType operationType,
            OffsetDateTime fromDate,
            OffsetDateTime toDate,
            Pageable pageable) {
        
        log.debug("Searching movements with filters - warehouse: {}, variant: {}, type: {}", 
                warehouseId, variantId, operationType);
        
        Page<Movement> movements = movementRepository.searchMovements(
                warehouseId, variantId, operationType, fromDate, toDate, pageable);
        
        return movements.map(movementMapper::toResponse);
    }

    /**
     * Obtiene todos los movimientos de una variante
     */
    public Page<MovementResponse> getMovementsByVariant(Long variantId, Pageable pageable) {
        log.debug("Getting movements for variant: {}", variantId);
        
        Page<Movement> movements = movementRepository.findByVariantIdOrderByCreatedAtDesc(variantId, pageable);
        return movements.map(movementMapper::toResponse);
    }

    /**
     * Obtiene todos los movimientos de un almacén
     */
    public Page<MovementResponse> getMovementsByWarehouse(Long warehouseId, Pageable pageable) {
        log.debug("Getting movements for warehouse: {}", warehouseId);
        
        Page<Movement> movements = movementRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId, pageable);
        return movements.map(movementMapper::toResponse);
    }

    /**
     * Obtiene movimientos por referencia (e.g., orderId)
     */
    public Page<MovementResponse> getMovementsByReference(
            Long referenceId,
            String referenceTable,
            Pageable pageable) {
        
        log.debug("Getting movements for reference: {} - {}", referenceTable, referenceId);
        
        Page<Movement> movements = movementRepository.findByReferenceIdAndReferenceTable(
                referenceId, referenceTable, pageable);
        
        return movements.map(movementMapper::toResponse);
    }

    /**
     * Registra un movimiento de inventario (INTERNO - usado por StockService)
     */
    @Transactional
    public Movement recordMovement(
            Long variantId,
            Long warehouseId,
            Integer quantity,
            BigDecimal unitCost,
            OperationType operationType,
            String description,
            Long referenceId,
            String referenceTable,
            Long userId) {
        
        log.debug("Recording movement - variant: {}, warehouse: {}, quantity: {}, type: {}", 
                variantId, warehouseId, quantity, operationType);
        
        // Validar entidades
        Variant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variante no encontrada con ID: " + variantId));
        
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + warehouseId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userId));
        
        // Obtener stock actual
        Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe stock para la variante " + variantId + " en el almacén " + warehouseId));
        
        // Calcular balance (cantidad actual después del movimiento)
        Integer balance = stock.getQuantity();
        
        // Crear movimiento
        Movement movement = Movement.builder()
                .variant(variant)
                .warehouse(warehouse)
                .quantity(quantity)
                .balance(balance)
                .unitCost(unitCost)
                .operationType(operationType)
                .description(description)
                .referenceId(referenceId)
                .referenceTable(referenceTable)
                .user(user)
                .build();
        
        movement = movementRepository.save(movement);
        
        log.info("Movement recorded with id: {} - type: {}, quantity: {}, balance: {}", 
                movement.getId(), operationType, quantity, balance);
        
        return movement;
    }

    /**
     * Obtiene el último balance de una variante en un almacén
     */
    public Integer getLastBalance(Long warehouseId, Long variantId) {
        return movementRepository.getLastBalance(warehouseId, variantId);
    }
}
