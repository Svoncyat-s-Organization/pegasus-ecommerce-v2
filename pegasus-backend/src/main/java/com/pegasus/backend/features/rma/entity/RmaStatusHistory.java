package com.pegasus.backend.features.rma.entity;

import com.pegasus.backend.features.user.entity.User;
import com.pegasus.backend.shared.enums.RmaStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Entidad RmaStatusHistory
 * Representa el historial de cambios de estado de una RMA
 * Proporciona auditoría completa de quién cambió el estado y cuándo
 */
@Entity
@Table(name = "rma_status_histories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RmaStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rma_id", nullable = false)
    private Long rmaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RmaStatus status;

    @Column(name = "comments", columnDefinition = "text")
    private String comments;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rma_id", insertable = false, updatable = false)
    private Rma rma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User creator;
}
