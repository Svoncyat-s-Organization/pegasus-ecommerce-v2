package com.pegasus.backend.features.catalog.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Entidad Image (Imagen)
 * Almacena las imágenes asociadas a productos y sus variantes
 */
@Entity
@Table(name = "images")
@Data
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", insertable = false, updatable = false)
    private Variant variant;
}
