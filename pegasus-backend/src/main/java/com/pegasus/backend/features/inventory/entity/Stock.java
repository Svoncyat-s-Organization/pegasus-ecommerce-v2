package com.pegasus.backend.features.inventory.entity;

import com.pegasus.backend.features.catalog.entity.Variant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Entidad Stock (Nivel de Inventario)
 * Representa el nivel de stock de una variante en un almacén específico
 * Incluye cantidad física y cantidad reservada para pedidos pendientes
 */
@Entity
@Table(name = "stocks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    @Builder.Default
    private Integer reservedQuantity = 0;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", insertable = false, updatable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", insertable = false, updatable = false)
    private Variant variant;

    /**
     * Calcula la cantidad disponible real (quantity - reservedQuantity)
     */
    @Transient
    public Integer getAvailableQuantity() {
        return quantity - reservedQuantity;
    }
}
