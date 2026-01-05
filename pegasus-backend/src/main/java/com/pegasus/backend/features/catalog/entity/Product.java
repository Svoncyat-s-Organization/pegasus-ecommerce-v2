package com.pegasus.backend.features.catalog.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

/**
 * Entidad Product (Producto)
 * Representa un producto en el catálogo con especificaciones técnicas en JSONB
 */
@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(callSuper = true)
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, length = 50, unique = true)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "slug", nullable = false, length = 50, unique = true)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "brand_id")
    private Long brandId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specs", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> specs = new HashMap<>();

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    // Relationships (fetch LAZY for performance)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", insertable = false, updatable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;
}
