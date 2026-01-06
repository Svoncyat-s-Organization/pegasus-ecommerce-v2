package com.pegasus.backend.features.rma.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.features.inventory.service.StockService;
import com.pegasus.backend.features.rma.dto.RmaResponse;
import com.pegasus.backend.features.rma.entity.Rma;
import com.pegasus.backend.features.rma.entity.RmaItem;
import com.pegasus.backend.features.rma.mapper.RmaMapper;
import com.pegasus.backend.features.rma.repository.RmaRepository;
import com.pegasus.backend.shared.enums.ItemCondition;
import com.pegasus.backend.shared.enums.RmaStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Service para procesar reembolsos y cierre de RMAs
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RmaRefundService {

    private final RmaService rmaService;
    private final RmaRepository rmaRepository;
    private final StockService stockService;
    private final RmaMapper rmaMapper;

    /**
     * Procesar reembolso de un RMA
     * En producción, aquí se integraría con la pasarela de pago
     */
    @Transactional
    public RmaResponse processRefund(Long rmaId, String comments, Long staffUserId) {
        log.info("Processing refund for RMA: {} by staff: {}", rmaId, staffUserId);

        Rma rma = rmaService.findRmaById(rmaId);

        // Validar estado
        if (rma.getStatus() != RmaStatus.INSPECTING) {
            throw new BadRequestException(
                    "Solo se pueden procesar reembolsos de RMAs en estado INSPECTING");
        }

        // Verificar que todos los items han sido inspeccionados
        if (!rma.areAllItemsInspected()) {
            throw new BadRequestException(
                    "No se puede procesar el reembolso hasta que todos los items sean inspeccionados");
        }

        // Verificar que hay un método de reembolso definido
        if (rma.getRefundMethod() == null) {
            throw new BadRequestException(
                    "Debe definir un método de reembolso antes de procesar");
        }

        // Aquí iría la integración con la pasarela de pago
        // Por ahora, mock de proceso exitoso
        log.info("Mock: Processing payment refund of {} via {} for RMA: {}",
                rma.getRefundAmount(), rma.getRefundMethod(), rma.getRmaNumber());

        // Actualizar estado
        rma.setStatus(RmaStatus.REFUNDED);
        rma.setRefundedAt(OffsetDateTime.now());

        String note = "Reembolso procesado: " + rma.getRefundAmount() +
                " vía " + rma.getRefundMethod() + ". " +
                (comments != null ? comments : "");

        if (rma.getStaffNotes() != null) {
            rma.setStaffNotes(rma.getStaffNotes() + "\n" + note);
        } else {
            rma.setStaffNotes(note);
        }

        Rma savedRma = rmaRepository.save(rma);

        rmaService.createStatusHistory(rma.getId(), RmaStatus.REFUNDED,
                note, staffUserId);

        log.info("Refund processed successfully for RMA: {}", rma.getRmaNumber());
        return rmaMapper.toResponse(savedRma);
    }

    /**
     * Cerrar RMA (paso final: restock si aplica + cerrar)
     */
    @Transactional
    public RmaResponse closeRma(Long rmaId, Long warehouseId, String comments, Long staffUserId) {
        log.info("Closing RMA: {} by staff: {}", rmaId, staffUserId);

        Rma rma = rmaService.findRmaById(rmaId);

        // Validar estado
        if (rma.getStatus() != RmaStatus.REFUNDED) {
            throw new BadRequestException(
                    "Solo se pueden cerrar RMAs en estado REFUNDED. Debe procesarse el reembolso primero.");
        }

        // Procesar restock de items aprobados
        int restockedItems = processRestockApprovedItems(rma, warehouseId, staffUserId);

        // Actualizar estado
        rma.setStatus(RmaStatus.CLOSED);
        rma.setClosedAt(OffsetDateTime.now());

        String note = "RMA cerrado. Items restockeados: " + restockedItems + ". " +
                (comments != null ? comments : "");

        if (rma.getStaffNotes() != null) {
            rma.setStaffNotes(rma.getStaffNotes() + "\n" + note);
        } else {
            rma.setStaffNotes(note);
        }

        Rma savedRma = rmaRepository.save(rma);

        rmaService.createStatusHistory(rma.getId(), RmaStatus.CLOSED,
                note, staffUserId);

        log.info("RMA closed successfully: {}. Restocked items: {}",
                rma.getRmaNumber(), restockedItems);
        return rmaMapper.toResponse(savedRma);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Procesar restock de items aprobados
     */
    private int processRestockApprovedItems(Rma rma, Long warehouseId, Long staffUserId) {
        int restockedCount = 0;

        List<RmaItem> approvedItems = rma.getItems().stream()
                .filter(RmaItem::getRestockApproved)
                .filter(item -> canBeRestocked(item.getItemCondition()))
                .toList();

        for (RmaItem item : approvedItems) {
            try {
                // Restock real + movimiento RETURN
                stockService.returnStock(
                        warehouseId,
                        item.getVariantId(),
                        item.getQuantity(),
                        rma.getId(),
                        staffUserId);

                restockedCount++;
                log.debug("Item restocked: RmaItem {} - Variant {} - Quantity {}",
                        item.getId(), item.getVariantId(), item.getQuantity());

            } catch (Exception e) {
                log.error("Error restocking item {}: {}", item.getId(), e.getMessage(), e);
                // Continuar con los demás items
            }
        }

        return restockedCount;
    }

    /**
     * Verificar si un item puede ser restockeado basado en su condición
     */
    private boolean canBeRestocked(ItemCondition condition) {
        if (condition == null) {
            return false;
        }
        return switch (condition) {
            case UNOPENED, OPENED_UNUSED, USED_LIKE_NEW -> true;
            case USED_GOOD, DAMAGED, DEFECTIVE -> false;
        };
    }
}
