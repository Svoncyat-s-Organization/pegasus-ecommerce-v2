package com.pegasus.backend.features.rma.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.rma.dto.InspectItemRequest;
import com.pegasus.backend.features.rma.dto.RmaItemResponse;
import com.pegasus.backend.features.rma.dto.RmaResponse;
import com.pegasus.backend.features.rma.entity.Rma;
import com.pegasus.backend.features.rma.entity.RmaItem;
import com.pegasus.backend.features.rma.mapper.RmaItemMapper;
import com.pegasus.backend.features.rma.mapper.RmaMapper;
import com.pegasus.backend.features.rma.repository.RmaItemRepository;
import com.pegasus.backend.features.rma.repository.RmaRepository;
import com.pegasus.backend.shared.enums.ItemCondition;
import com.pegasus.backend.shared.enums.RmaStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Service para inspección de items devueltos
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RmaInspectionService {

    private final RmaService rmaService;
    private final RmaRepository rmaRepository;
    private final RmaItemRepository rmaItemRepository;
    private final RmaMapper rmaMapper;
    private final RmaItemMapper rmaItemMapper;

    /**
     * Inspeccionar un item devuelto
     */
    @Transactional
    public RmaItemResponse inspectItem(InspectItemRequest request, Long staffUserId) {
        log.info("Inspecting RMA item: {} by staff: {}", request.rmaItemId(), staffUserId);

        RmaItem rmaItem = rmaItemRepository.findById(request.rmaItemId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RMA item no encontrado con ID: " + request.rmaItemId()));

        Rma rma = rmaService.findRmaById(rmaItem.getRmaId());

        // Validar que el RMA está en estado válido para inspección
        if (rma.getStatus() != RmaStatus.RECEIVED && rma.getStatus() != RmaStatus.INSPECTING) {
            throw new BadRequestException(
                    "Solo se pueden inspeccionar items de RMAs en estado RECEIVED o INSPECTING. Estado actual: " 
                    + rma.getStatus());
        }

        // Validar que el item no ha sido inspeccionado previamente
        if (rmaItem.isInspected()) {
            throw new BadRequestException(
                    "Este item ya fue inspeccionado el " + rmaItem.getInspectedAt());
        }

        // Actualizar item con datos de inspección
        rmaItem.setItemCondition(request.itemCondition());
        rmaItem.setInspectionNotes(request.inspectionNotes());
        rmaItem.setRestockApproved(request.restockApproved());
        rmaItem.setInspectedBy(staffUserId);
        rmaItem.setInspectedAt(OffsetDateTime.now());

        // Ajustar refund_amount basado en la condición
        adjustRefundBasedOnCondition(rmaItem);

        RmaItem savedItem = rmaItemRepository.save(rmaItem);

        // Actualizar estado del RMA si empezó inspección
        if (rma.getStatus() == RmaStatus.RECEIVED) {
            rma.setStatus(RmaStatus.INSPECTING);
            rmaRepository.save(rma);
            rmaService.createStatusHistory(rma.getId(), RmaStatus.INSPECTING, 
                    "Inspección de items iniciada", staffUserId);
        }

        // Si todos los items están inspeccionados, recalcular refund total
        if (rma.areAllItemsInspected()) {
            recalculateRmaRefund(rma);
        }

        log.info("RMA item inspected successfully: {}", rmaItem.getId());
        return rmaItemMapper.toResponse(savedItem);
    }

    /**
     * Obtener items pendientes de inspección de un RMA
     */
    public List<RmaItemResponse> getUninspectedItems(Long rmaId) {
        log.debug("Getting uninspected items for RMA: {}", rmaId);

        Rma rma = rmaService.findRmaById(rmaId);
        
        List<RmaItem> uninspectedItems = rma.getItems().stream()
                .filter(item -> !item.isInspected())
                .toList();

        return rmaItemMapper.toResponseList(uninspectedItems);
    }

    /**
     * Completar inspección de un RMA
     */
    @Transactional
    public RmaResponse completeInspection(Long rmaId, String comments, Long staffUserId) {
        log.info("Completing inspection for RMA: {} by staff: {}", rmaId, staffUserId);

        Rma rma = rmaService.findRmaById(rmaId);

        if (rma.getStatus() != RmaStatus.INSPECTING) {
            throw new BadRequestException(
                    "Solo se puede completar la inspección de RMAs en estado INSPECTING");
        }

        // Verificar que todos los items han sido inspeccionados
        if (!rma.areAllItemsInspected()) {
            long uninspectedCount = rma.getItems().stream()
                    .filter(item -> !item.isInspected())
                    .count();
            throw new BadRequestException(
                    "Aún hay " + uninspectedCount + " items sin inspeccionar");
        }

        // Actualizar estado (automáticamente pasa a listo para reembolso)
        // En producción, aquí se iniciaría el proceso de reembolso
        String note = "Inspección completada. Todos los items han sido evaluados. " 
                + (comments != null ? comments : "");
        
        if (rma.getStaffNotes() != null) {
            rma.setStaffNotes(rma.getStaffNotes() + "\n" + note);
        } else {
            rma.setStaffNotes(note);
        }

        Rma savedRma = rmaRepository.save(rma);

        rmaService.createStatusHistory(rma.getId(), RmaStatus.INSPECTING, 
                note, staffUserId);

        log.info("Inspection completed for RMA: {}", rma.getRmaNumber());
        return rmaMapper.toResponse(savedRma);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Ajustar refund_amount basado en la condición del item
     */
    private void adjustRefundBasedOnCondition(RmaItem rmaItem) {
        ItemCondition condition = rmaItem.getItemCondition();
        BigDecimal originalRefund = rmaItem.getRefundAmount();

        // Política de ajuste de reembolso según condición
        BigDecimal adjustmentPercentage = switch (condition) {
            case UNOPENED, OPENED_UNUSED -> 
                BigDecimal.ONE; // 100% reembolso
            case USED_LIKE_NEW -> 
                new BigDecimal("0.95"); // 95% reembolso
            case USED_GOOD -> 
                new BigDecimal("0.80"); // 80% reembolso
            case DAMAGED -> 
                new BigDecimal("0.30"); // 30% reembolso (valor de salvamento)
            case DEFECTIVE -> 
                BigDecimal.ONE; // 100% reembolso (culpa de la empresa)
        };

        BigDecimal adjustedRefund = originalRefund.multiply(adjustmentPercentage)
                .setScale(2, BigDecimal.ROUND_HALF_UP);

        rmaItem.setRefundAmount(adjustedRefund);

        log.debug("Refund adjusted for item {}: {} -> {} ({}% of original)",
                rmaItem.getId(), originalRefund, adjustedRefund, 
                adjustmentPercentage.multiply(new BigDecimal("100")));
    }

    /**
     * Recalcular refund_amount total del RMA después de inspección
     */
    private void recalculateRmaRefund(Rma rma) {
        log.debug("Recalculating refund for RMA: {}", rma.getId());

        BigDecimal newRefundAmount = rma.calculateRefundAmount();
        rma.setRefundAmount(newRefundAmount);
        rmaRepository.save(rma);

        log.debug("RMA {} refund recalculated: {}", rma.getRmaNumber(), newRefundAmount);
    }
}
