package com.pegasus.backend.features.inventory.service;

import com.pegasus.backend.features.catalog.entity.Variant;
import com.pegasus.backend.features.catalog.repository.VariantRepository;
import com.pegasus.backend.features.inventory.dto.*;
import com.pegasus.backend.features.inventory.entity.Stock;
import com.pegasus.backend.features.inventory.entity.Warehouse;
import com.pegasus.backend.features.inventory.mapper.StockMapper;
import com.pegasus.backend.features.inventory.repository.StockRepository;
import com.pegasus.backend.features.inventory.repository.WarehouseRepository;
import com.pegasus.backend.shared.enums.OperationType;
import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Servicio para gestión de stock de inventario
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {

        private final StockRepository stockRepository;
        private final WarehouseRepository warehouseRepository;
        private final VariantRepository variantRepository;
        private final MovementService movementService;
        private final StockMapper stockMapper;

        /**
         * Obtiene todo el stock de un almacén.
         * Lista TODAS las variantes activas, mostrando stock 0 si no existe registro.
         */
        public Page<StockResponse> getStockByWarehouse(Long warehouseId, Pageable pageable) {
                log.debug("Getting stock for warehouse: {}", warehouseId);

                Warehouse warehouse = warehouseRepository.findById(warehouseId)
                        .orElseThrow(() -> new ResourceNotFoundException("Almacén no encontrado con ID: " + warehouseId));

                // Get all active variants with pagination
                Page<Variant> variants = variantRepository.findAllActiveVariants(pageable);
                
                // Map each variant to StockResponse, using existing stock or creating empty one
                return variants.map(variant -> {
                        Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variant.getId())
                                .orElse(null);
                        
                        if (stock != null) {
                                return stockMapper.toResponse(stock);
                        } else {
                                // Return a virtual stock response with 0 quantity
                                return new StockResponse(
                                        null, // No ID yet
                                        warehouseId,
                                        warehouse.getCode(),
                                        warehouse.getName(),
                                        variant.getId(),
                                        variant.getSku(),
                                        variant.getProduct() != null ? variant.getProduct().getName() : "N/A",
                                        0, // quantity
                                        0, // reservedQuantity
                                        0, // availableQuantity
                                        null // updatedAt
                                );
                        }
                });
        }

        /**
         * Obtiene todo el stock de una variante (en todos los almacenes)
         */
        public List<StockSummaryResponse> getStockByVariant(Long variantId) {
                log.debug("Getting stock for variant: {}", variantId);

                if (!variantRepository.existsById(variantId)) {
                        throw new ResourceNotFoundException("Variante no encontrada con ID: " + variantId);
                }

                List<Stock> stocks = stockRepository.findByVariantId(variantId);
                return stocks.stream()
                                .map(stockMapper::toSummaryResponse)
                                .toList();
        }

        /**
         * Obtiene el stock de una variante en un almacén específico
         */
        public StockResponse getStockByWarehouseAndVariant(Long warehouseId, Long variantId) {
                log.debug("Getting stock for warehouse: {} and variant: {}", warehouseId, variantId);

                Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No existe stock para la variante " + variantId + " en el almacén "
                                                                + warehouseId));

                return stockMapper.toResponse(stock);
        }

        /**
         * Verifica disponibilidad de stock
         */
        public StockAvailabilityResponse checkStockAvailability(Long warehouseId, Long variantId,
                        Integer requiredQuantity) {
                log.debug("Checking stock availability - warehouse: {}, variant: {}, required: {}",
                                warehouseId, variantId, requiredQuantity);

                Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variantId)
                                .orElse(null);

                if (stock == null) {
                        return new StockAvailabilityResponse(
                                        variantId,
                                        null,
                                        warehouseId,
                                        null,
                                        0,
                                        0,
                                        0,
                                        false,
                                        "No existe stock para esta variante en el almacén especificado");
                }

                Integer availableQuantity = stock.getAvailableQuantity();
                boolean isAvailable = availableQuantity >= requiredQuantity;
                String message = isAvailable
                                ? "Stock disponible suficiente"
                                : "Stock insuficiente. Disponible: " + availableQuantity + ", Requerido: "
                                                + requiredQuantity;

                return new StockAvailabilityResponse(
                                variantId,
                                stock.getVariant().getSku(),
                                warehouseId,
                                stock.getWarehouse().getCode(),
                                stock.getQuantity(),
                                stock.getReservedQuantity(),
                                availableQuantity,
                                isAvailable,
                                message);
        }

        /**
         * Obtiene variantes con stock bajo en un almacén
         */
        public List<StockSummaryResponse> getLowStockByWarehouse(Long warehouseId, Integer threshold) {
                log.debug("Getting low stock for warehouse: {} with threshold: {}", warehouseId, threshold);

                if (!warehouseRepository.existsById(warehouseId)) {
                        throw new ResourceNotFoundException("Almacén no encontrado con ID: " + warehouseId);
                }

                List<Stock> stocks = stockRepository.findLowStockByWarehouse(warehouseId, threshold);
                return stocks.stream()
                                .map(stockMapper::toSummaryResponse)
                                .toList();
        }

        /**
         * Ajusta stock manualmente (incremento o decremento)
         */
        @Transactional
        public StockResponse adjustStock(AdjustStockRequest request, Long userId) {
                log.info("Adjusting stock - variant: {}, warehouse: {}, change: {}",
                                request.variantId(), request.warehouseId(), request.quantityChange());

                if (request.warehouseId() == null) {
                        throw new BadRequestException("warehouseId es requerido");
                }

                if (request.variantId() == null) {
                        throw new BadRequestException("variantId es requerido");
                }

                // Validar entidades
                Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Almacén no encontrado con ID: " + request.warehouseId()));

                Variant variant = variantRepository.findById(request.variantId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Variante no encontrada con ID: " + request.variantId()));

                // Obtener o crear stock
                Stock stock = stockRepository.findByWarehouseIdAndVariantId(request.warehouseId(), request.variantId())
                                .orElseGet(() -> {
                                        Stock newStock = Stock.builder()
                                                        .warehouseId(warehouse.getId())
                                                        .variantId(variant.getId())
                                                        .quantity(0)
                                                        .reservedQuantity(0)
                                                        .build();
                                        return stockRepository.save(newStock);
                                });

                // Validar que el ajuste negativo no deje stock negativo
                Integer newQuantity = stock.getQuantity() + request.quantityChange();
                if (newQuantity < 0) {
                        throw new BadRequestException("El ajuste resultaría en stock negativo. Stock actual: "
                                        + stock.getQuantity() + ", Cambio solicitado: " + request.quantityChange());
                }

                // Actualizar stock
                stock.setQuantity(newQuantity);
                stock = stockRepository.save(stock);

                // Registrar movimiento (usar el stock como referencia para cumplir NOT NULL)
                movementService.recordMovement(
                                request.variantId(),
                                request.warehouseId(),
                                request.quantityChange(),
                                BigDecimal.ZERO, // No aplica costo unitario en ajustes manuales
                                OperationType.INVENTORY_ADJUSTMENT,
                                request.reason(),
                                stock.getId(),
                                "stocks",
                                userId);

                log.info("Stock adjusted - new quantity: {} for variant: {} in warehouse: {}",
                                newQuantity, request.variantId(), request.warehouseId());

                return stockMapper.toResponse(stock);
        }

        /**
         * Transfiere stock entre almacenes
         */
        @Transactional
        public void transferStock(TransferStockRequest request, Long userId) {
                log.info("Transferring stock - variant: {}, from: {}, to: {}, quantity: {}",
                                request.variantId(), request.fromWarehouseId(), request.toWarehouseId(),
                                request.quantity());

                if (request.fromWarehouseId() == null || request.toWarehouseId() == null) {
                        throw new BadRequestException("Los almacenes de origen y destino son requeridos");
                }

                if (request.variantId() == null) {
                        throw new BadRequestException("variantId es requerido");
                }

                if (request.fromWarehouseId().equals(request.toWarehouseId())) {
                        throw new BadRequestException("Los almacenes de origen y destino no pueden ser los mismos");
                }

                // Validar entidades
                Warehouse fromWarehouse = warehouseRepository.findById(request.fromWarehouseId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Almacén de origen no encontrado con ID: "
                                                                + request.fromWarehouseId()));

                Warehouse toWarehouse = warehouseRepository.findById(request.toWarehouseId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Almacén de destino no encontrado con ID: " + request.toWarehouseId()));

                Variant variant = variantRepository.findById(request.variantId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Variante no encontrada con ID: " + request.variantId()));

                // Obtener stock de origen
                Stock fromStock = stockRepository
                                .findByWarehouseIdAndVariantId(request.fromWarehouseId(), request.variantId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No existe stock en el almacén de origen para la variante "
                                                                + request.variantId()));

                // Validar disponibilidad
                if (fromStock.getAvailableQuantity() < request.quantity()) {
                        throw new BadRequestException("Stock insuficiente en el almacén de origen. Disponible: "
                                        + fromStock.getAvailableQuantity() + ", Requerido: " + request.quantity());
                }

                // Obtener o crear stock de destino
                Stock toStock = stockRepository
                                .findByWarehouseIdAndVariantId(request.toWarehouseId(), request.variantId())
                                .orElseGet(() -> {
                                        Stock newStock = Stock.builder()
                                                        .warehouseId(toWarehouse.getId())
                                                        .variantId(variant.getId())
                                                        .quantity(0)
                                                        .reservedQuantity(0)
                                                        .build();
                                        return stockRepository.save(newStock);
                                });

                // Actualizar stocks
                fromStock.setQuantity(fromStock.getQuantity() - request.quantity());
                toStock.setQuantity(toStock.getQuantity() + request.quantity());

                stockRepository.save(fromStock);
                stockRepository.save(toStock);

                // Registrar movimientos
                String description = request.reason() != null
                                ? request.reason()
                                : "Transferencia desde " + fromWarehouse.getCode() + " hacia " + toWarehouse.getCode();

                movementService.recordMovement(
                                request.variantId(),
                                request.fromWarehouseId(),
                                -request.quantity(),
                                BigDecimal.ZERO,
                                OperationType.TRANSFER_OUT,
                                description + " (salida)",
                                fromStock.getId(),
                                "stocks",
                                userId);

                movementService.recordMovement(
                                request.variantId(),
                                request.toWarehouseId(),
                                request.quantity(),
                                BigDecimal.ZERO,
                                OperationType.TRANSFER_IN,
                                description + " (entrada)",
                                toStock.getId(),
                                "stocks",
                                userId);

                log.info("Stock transferred successfully - variant: {}, quantity: {}", request.variantId(),
                                request.quantity());
        }

        /**
         * Reserva stock para un pedido (INTERNO - usado por OrderService)
         */
        @Transactional
        public void reserveStock(Long warehouseId, Long variantId, Integer quantity, Long orderId, Long userId) {
                log.info("Reserving stock - warehouse: {}, variant: {}, quantity: {}, order: {}",
                                warehouseId, variantId, quantity, orderId);

                Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No existe stock para la variante " + variantId + " en el almacén "
                                                                + warehouseId));

                if (stock.getAvailableQuantity() < quantity) {
                        throw new BadRequestException("Stock insuficiente para reservar. Disponible: "
                                        + stock.getAvailableQuantity() + ", Requerido: " + quantity);
                }

                stock.setReservedQuantity(stock.getReservedQuantity() + quantity);
                stockRepository.save(stock);

                log.info("Stock reserved successfully - variant: {}, quantity: {}, order: {}", variantId, quantity,
                                orderId);
        }

        /**
         * Libera stock reservado (INTERNO - usado por OrderService al cancelar)
         */
        @Transactional
        public void releaseReservedStock(Long warehouseId, Long variantId, Integer quantity, Long orderId,
                        Long userId) {
                log.info("Releasing reserved stock - warehouse: {}, variant: {}, quantity: {}, order: {}",
                                warehouseId, variantId, quantity, orderId);

                Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No existe stock para la variante " + variantId + " en el almacén "
                                                                + warehouseId));

                stock.setReservedQuantity(Math.max(0, stock.getReservedQuantity() - quantity));
                stockRepository.save(stock);

                // Registrar movimiento de cancelación
                movementService.recordMovement(
                                variantId,
                                warehouseId,
                                quantity,
                                BigDecimal.ZERO,
                                OperationType.CANCELLATION,
                                "Liberación de stock reservado por cancelación de pedido",
                                orderId,
                                "orders",
                                userId);

                log.info("Reserved stock released successfully - variant: {}, quantity: {}, order: {}", variantId,
                                quantity, orderId);
        }

        /**
         * Decrementa stock físico al enviar un pedido (INTERNO - usado por
         * OrderService)
         */
        @Transactional
        public void decreaseStock(Long warehouseId, Long variantId, Integer quantity, Long orderId, Long userId) {
                log.info("Decreasing stock - warehouse: {}, variant: {}, quantity: {}, order: {}",
                                warehouseId, variantId, quantity, orderId);

                Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "No existe stock para la variante " + variantId + " en el almacén "
                                                                + warehouseId));

                // Decrementar cantidad física y reservada
                stock.setQuantity(stock.getQuantity() - quantity);
                stock.setReservedQuantity(Math.max(0, stock.getReservedQuantity() - quantity));
                stockRepository.save(stock);

                // Registrar movimiento de venta
                movementService.recordMovement(
                                variantId,
                                warehouseId,
                                -quantity,
                                BigDecimal.ZERO,
                                OperationType.SALE,
                                "Venta - Pedido #" + orderId,
                                orderId,
                                "orders",
                                userId);

                log.info("Stock decreased successfully - variant: {}, quantity: {}, order: {}", variantId, quantity,
                                orderId);
        }

        /**
         * Incrementa stock al recibir una compra (INTERNO - usado por PurchaseService)
         */
        @Transactional
        public void increaseStock(Long warehouseId, Long variantId, Integer quantity,
                        BigDecimal unitCost, Long purchaseId, Long userId) {
                log.info("Increasing stock - warehouse: {}, variant: {}, quantity: {}, purchase: {}",
                                warehouseId, variantId, quantity, purchaseId);

                if (warehouseId == null) {
                        throw new BadRequestException("warehouseId es requerido");
                }

                if (variantId == null) {
                        throw new BadRequestException("variantId es requerido");
                }

                Warehouse warehouse = warehouseRepository.findById(warehouseId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Almacén no encontrado con ID: " + warehouseId));

                Variant variant = variantRepository.findById(variantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Variante no encontrada con ID: " + variantId));

                // Obtener o crear stock
                Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variantId)
                                .orElseGet(() -> {
                                        Stock newStock = Stock.builder()
                                                        .warehouseId(warehouse.getId())
                                                        .variantId(variant.getId())
                                                        .quantity(0)
                                                        .reservedQuantity(0)
                                                        .build();
                                        return stockRepository.save(newStock);
                                });

                stock.setQuantity(stock.getQuantity() + quantity);
                stockRepository.save(stock);

                // Registrar movimiento de compra
                movementService.recordMovement(
                                variantId,
                                warehouseId,
                                quantity,
                                unitCost,
                                OperationType.PURCHASE,
                                "Compra - Orden de compra #" + purchaseId,
                                purchaseId,
                                "purchases",
                                userId);

                log.info("Stock increased successfully - variant: {}, quantity: {}, purchase: {}", variantId, quantity,
                                purchaseId);
        }

        /**
         * Incrementa stock por devolución (INTERNO - usado por RMAService)
         */
        @Transactional
        public void returnStock(Long warehouseId, Long variantId, Integer quantity, Long rmaId, Long userId) {
                log.info("Returning stock - warehouse: {}, variant: {}, quantity: {}, rma: {}",
                                warehouseId, variantId, quantity, rmaId);

                if (warehouseId == null) {
                        throw new BadRequestException("warehouseId es requerido");
                }

                if (variantId == null) {
                        throw new BadRequestException("variantId es requerido");
                }

                Warehouse warehouse = warehouseRepository.findById(warehouseId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Almacén no encontrado con ID: " + warehouseId));

                Variant variant = variantRepository.findById(variantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Variante no encontrada con ID: " + variantId));

                Stock stock = stockRepository.findByWarehouseIdAndVariantId(warehouseId, variantId)
                                .orElseGet(() -> {
                                        Stock newStock = Stock.builder()
                                                        .warehouseId(warehouse.getId())
                                                        .variantId(variant.getId())
                                                        .quantity(0)
                                                        .reservedQuantity(0)
                                                        .build();
                                        return stockRepository.save(newStock);
                                });

                stock.setQuantity(stock.getQuantity() + quantity);
                stockRepository.save(stock);

                // Registrar movimiento de devolución
                movementService.recordMovement(
                                variantId,
                                warehouseId,
                                quantity,
                                BigDecimal.ZERO,
                                OperationType.RETURN,
                                "Devolución - RMA #" + rmaId,
                                rmaId,
                                "rma",
                                userId);

                log.info("Stock returned successfully - variant: {}, quantity: {}, rma: {}", variantId, quantity,
                                rmaId);
        }

        /**
         * Inicializa registros de stock (0) para una variante en todos los almacenes
         * activos.
         *
         * Se usa al crear una variante nueva, para que aparezca con stock 0 en todos
         * los almacenes.
         */
        @Transactional
        public void initializeZeroStockForVariantAcrossActiveWarehouses(Long variantId) {
                if (variantId == null) {
                        throw new BadRequestException("variantId es requerido");
                }

                if (!variantRepository.existsById(variantId)) {
                        throw new ResourceNotFoundException("Variante no encontrada con ID: " + variantId);
                }

                List<Warehouse> activeWarehouses = warehouseRepository.findByIsActiveTrue();
                if (activeWarehouses.isEmpty()) {
                        return;
                }

                List<Stock> existingStocks = stockRepository.findByVariantId(variantId);
                Set<Long> existingWarehouseIds = new HashSet<>();
                for (Stock s : existingStocks) {
                        if (s.getWarehouseId() != null) {
                                existingWarehouseIds.add(s.getWarehouseId());
                        }
                }

                List<Stock> toCreate = new ArrayList<>();
                for (Warehouse w : activeWarehouses) {
                        if (existingWarehouseIds.contains(w.getId())) {
                                continue;
                        }

                        Stock newStock = Stock.builder()
                                        .warehouseId(w.getId())
                                        .variantId(variantId)
                                        .quantity(0)
                                        .reservedQuantity(0)
                                        .build();
                        toCreate.add(newStock);
                }

                if (!toCreate.isEmpty()) {
                        stockRepository.saveAll(toCreate);
                }
        }
}
