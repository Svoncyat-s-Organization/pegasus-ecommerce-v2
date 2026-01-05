package com.pegasus.backend.features.order.entity;

import com.pegasus.backend.features.catalog.entity.Product;
import com.pegasus.backend.features.catalog.entity.Variant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Entidad OrderItem (Item del Pedido)
 * Representa un producto/variante dentro de un pedido
 * Los campos sku y productName están desnormalizados para preservar el historial
 */
@Entity
@Table(name = "order_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(name = "sku", nullable = false, columnDefinition = "TEXT")
    private String sku;

    @Column(name = "product_name", nullable = false, columnDefinition = "TEXT")
    private String productName;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", insertable = false, updatable = false)
    private Variant variant;

    /**
     * Helper method to get orderId for convenience
     */
    public Long getOrderId() {
        return order != null ? order.getId() : null;
    }
}
