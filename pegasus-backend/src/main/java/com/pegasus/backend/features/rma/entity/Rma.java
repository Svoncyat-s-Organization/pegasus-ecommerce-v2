package com.pegasus.backend.features.rma.entity;

import com.pegasus.backend.features.customer.entity.Customer;
import com.pegasus.backend.features.order.entity.Order;
import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.shared.entity.BaseEntity;
import com.pegasus.backend.shared.enums.RefundMethod;
import com.pegasus.backend.shared.enums.RmaReason;
import com.pegasus.backend.shared.enums.RmaStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad Rma (Return Merchandise Authorization)
 * Representa una solicitud de devolución de productos por parte de un cliente
 */
@Entity
@Table(name = "rmas")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rma extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rma_number", nullable = false, unique = true, length = 50)
    private String rmaNumber;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RmaStatus status = RmaStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false)
    private RmaReason reason;

    @Column(name = "customer_comments", columnDefinition = "text")
    private String customerComments;

    @Column(name = "staff_notes", columnDefinition = "text")
    private String staffNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_method")
    private RefundMethod refundMethod;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "restocking_fee", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal restockingFee = BigDecimal.ZERO;

    @Column(name = "shipping_cost_refund", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingCostRefund = BigDecimal.ZERO;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "received_at")
    private OffsetDateTime receivedAt;

    @Column(name = "refunded_at")
    private OffsetDateTime refundedAt;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by", insertable = false, updatable = false)
    private User approver;

    @OneToMany(mappedBy = "rma", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RmaItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "rma", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<RmaStatusHistory> statusHistories = new ArrayList<>();

    // Helper methods
    public void addItem(RmaItem item) {
        items.add(item);
        item.setRma(this);
    }

    public void removeItem(RmaItem item) {
        items.remove(item);
        item.setRma(null);
    }

    public void addStatusHistory(RmaStatusHistory history) {
        statusHistories.add(history);
        history.setRma(this);
    }

    /**
     * Calcula el monto total de reembolso
     * refund_amount = SUM(rma_items.refund_amount) - restocking_fee + shipping_cost_refund
     */
    public BigDecimal calculateRefundAmount() {
        BigDecimal itemsTotal = items.stream()
                .map(RmaItem::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return itemsTotal
                .subtract(restockingFee)
                .add(shippingCostRefund);
    }

    /**
     * Verifica si todos los items han sido inspeccionados
     */
    public boolean areAllItemsInspected() {
        return items.stream()
                .allMatch(item -> item.getItemCondition() != null);
    }

    /**
     * Verifica si la RMA está en un estado que permite edición
     */
    public boolean isEditable() {
        return status == RmaStatus.PENDING || status == RmaStatus.APPROVED;
    }

    /**
     * Verifica si la RMA está finalizada
     */
    public boolean isFinalized() {
        return status == RmaStatus.CLOSED || 
               status == RmaStatus.CANCELLED || 
               status == RmaStatus.REJECTED;
    }
}
