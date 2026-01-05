package com.pegasus.backend.features.rma.entity;

import com.pegasus.backend.features.catalog.entity.Variant;
import com.pegasus.backend.features.order.entity.OrderItem;
import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.shared.enums.ItemCondition;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Entidad RmaItem
 * Representa un item individual devuelto dentro de una RMA
 */
@Entity
@Table(name = "rma_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RmaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rma_id", nullable = false)
    private Long rmaId;

    @Column(name = "order_item_id", nullable = false)
    private Long orderItemId;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_condition")
    private ItemCondition itemCondition;

    @Column(name = "inspection_notes", columnDefinition = "text")
    private String inspectionNotes;

    @Column(name = "refund_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "restock_approved", nullable = false)
    @Builder.Default
    private Boolean restockApproved = false;

    @Column(name = "inspected_by")
    private Long inspectedBy;

    @Column(name = "inspected_at")
    private OffsetDateTime inspectedAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rma_id", insertable = false, updatable = false)
    private Rma rma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", insertable = false, updatable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", insertable = false, updatable = false)
    private Variant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspected_by", insertable = false, updatable = false)
    private User inspector;

    /**
     * Verifica si el item ha sido inspeccionado
     */
    public boolean isInspected() {
        return itemCondition != null && inspectedAt != null;
    }

    /**
     * Determina si el item puede ser restockeado basado en su condición
     */
    public boolean canBeRestocked() {
        if (itemCondition == null) {
            return false;
        }
        return switch (itemCondition) {
            case UNOPENED, OPENED_UNUSED, USED_LIKE_NEW -> true;
            case USED_GOOD, DAMAGED, DEFECTIVE -> false;
        };
    }
}
