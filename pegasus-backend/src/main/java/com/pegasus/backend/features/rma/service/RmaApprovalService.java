package com.pegasus.backend.features.rma.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.features.rma.dto.ApproveRmaRequest;
import com.pegasus.backend.features.rma.dto.RmaResponse;
import com.pegasus.backend.features.rma.entity.Rma;
import com.pegasus.backend.features.rma.mapper.RmaMapper;
import com.pegasus.backend.features.rma.repository.RmaRepository;
import com.pegasus.backend.shared.enums.RmaReason;
import com.pegasus.backend.shared.enums.RmaStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Service para aprobación/rechazo de RMAs por staff
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RmaApprovalService {

    private final RmaService rmaService;
    private final RmaRepository rmaRepository;
    private final RmaMapper rmaMapper;

    /**
     * Aprobar o rechazar una solicitud de RMA
     */
    @Transactional
    public RmaResponse approveOrRejectRma(Long rmaId, ApproveRmaRequest request, Long staffUserId) {
        log.info("Processing RMA approval/rejection for id: {} by staff: {}", 
                rmaId, staffUserId);

        Rma rma = rmaService.findRmaById(rmaId);

        // Validar que está en estado PENDING
        if (rma.getStatus() != RmaStatus.PENDING) {
            throw new BadRequestException(
                    "Solo se pueden aprobar/rechazar RMAs en estado PENDING. Estado actual: " 
                    + rma.getStatus());
        }

        if (request.approved()) {
            return approveRma(rma, request.comments(), staffUserId);
        } else {
            return rejectRma(rma, request.comments(), staffUserId);
        }
    }

    /**
     * Aprobar RMA
     */
    private RmaResponse approveRma(Rma rma, String comments, Long staffUserId) {
        log.info("Approving RMA: {}", rma.getRmaNumber());

        rma.setStatus(RmaStatus.APPROVED);
        rma.setApprovedBy(staffUserId);
        rma.setApprovedAt(OffsetDateTime.now());

        // Calcular cargos basados en el motivo de devolución
        calculateFeesAndRefunds(rma);

        // Actualizar notas del staff
        String approvalNote = "RMA aprobado. " + (comments != null ? comments : "");
        rma.setStaffNotes(approvalNote);

        Rma savedRma = rmaRepository.save(rma);

        // Crear historial
        rmaService.createStatusHistory(rma.getId(), RmaStatus.APPROVED, 
                approvalNote, staffUserId);

        log.info("RMA approved successfully: {}", rma.getRmaNumber());
        return rmaMapper.toResponse(savedRma);
    }

    /**
     * Rechazar RMA
     */
    private RmaResponse rejectRma(Rma rma, String comments, Long staffUserId) {
        log.info("Rejecting RMA: {}", rma.getRmaNumber());

        if (comments == null || comments.isBlank()) {
            throw new BadRequestException(
                    "Debe proporcionar una razón para rechazar la devolución");
        }

        rma.setStatus(RmaStatus.REJECTED);
        rma.setApprovedBy(staffUserId);
        rma.setApprovedAt(OffsetDateTime.now());

        String rejectionNote = "RMA rechazado. Motivo: " + comments;
        rma.setStaffNotes(rejectionNote);

        Rma savedRma = rmaRepository.save(rma);

        // Crear historial
        rmaService.createStatusHistory(rma.getId(), RmaStatus.REJECTED, 
                rejectionNote, staffUserId);

        log.info("RMA rejected: {}", rma.getRmaNumber());
        return rmaMapper.toResponse(savedRma);
    }

    /**
     * Calcular cargos y reembolsos basados en el motivo de devolución
     */
    private void calculateFeesAndRefunds(Rma rma) {
        RmaReason reason = rma.getReason();

        // Política de cargos por reposición (restocking fee)
        BigDecimal restockingFeePercentage = switch (reason) {
            case DEFECTIVE, WRONG_ITEM, NOT_AS_DESCRIBED, DAMAGED_SHIPPING -> 
                BigDecimal.ZERO; // Culpa de la empresa, sin cargo
            case CHANGED_MIND, SIZE_COLOR -> 
                new BigDecimal("0.10"); // 10% cargo por cambio de opinión
            case LATE_DELIVERY, OTHER -> 
                new BigDecimal("0.05"); // 5% cargo moderado
        };

        // Calcular cargo por reposición
        BigDecimal itemsTotal = rma.getItems().stream()
                .map(item -> item.getRefundAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal restockingFee = itemsTotal.multiply(restockingFeePercentage)
                .setScale(2, BigDecimal.ROUND_HALF_UP);

        rma.setRestockingFee(restockingFee);

        // Política de reembolso de envío
        // Solo si la culpa es de la empresa
        BigDecimal shippingCostRefund = switch (reason) {
            case DEFECTIVE, WRONG_ITEM, NOT_AS_DESCRIBED, DAMAGED_SHIPPING -> 
                BigDecimal.ZERO; // Simplificado: obtener del order en producción
            default -> BigDecimal.ZERO;
        };

        rma.setShippingCostRefund(shippingCostRefund);

        // Calcular refund_amount final
        rma.setRefundAmount(rma.calculateRefundAmount());
    }

    /**
     * Marcar RMA como recibido en warehouse
     */
    @Transactional
    public RmaResponse markAsReceived(Long rmaId, String comments, Long staffUserId) {
        log.info("Marking RMA as received: {} by staff: {}", rmaId, staffUserId);

        Rma rma = rmaService.findRmaById(rmaId);

        if (rma.getStatus() != RmaStatus.IN_TRANSIT) {
            throw new BadRequestException(
                    "Solo se pueden marcar como recibidos RMAs en estado IN_TRANSIT. Estado actual: " 
                    + rma.getStatus());
        }

        rma.setStatus(RmaStatus.RECEIVED);
        rma.setReceivedAt(OffsetDateTime.now());

        Rma savedRma = rmaRepository.save(rma);

        // Crear historial
        String note = "Paquete recibido en warehouse. " + (comments != null ? comments : "");
        rmaService.createStatusHistory(rma.getId(), RmaStatus.RECEIVED, note, staffUserId);

        log.info("RMA marked as received: {}", rma.getRmaNumber());
        return rmaMapper.toResponse(savedRma);
    }
}
