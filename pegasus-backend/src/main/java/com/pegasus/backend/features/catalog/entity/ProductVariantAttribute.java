package com.pegasus.backend.features.catalog.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

/**
 * Entidad ProductVariantAttribute
 * Tabla de unión que vincula productos con atributos de variantes del catálogo global.
 * Permite asignar atributos específicos a cada producto y opcionalmente personalizar las opciones.
 */
@Entity
@Table(name = "product_variant_attributes")
@Data
@EqualsAndHashCode(callSuper = true)
public class ProductVariantAttribute extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_attribute_id", nullable = false)
    private Long variantAttributeId;

    /**
     * Opciones personalizadas para este producto.
     * Si es null, se usan las opciones globales del VariantAttribute.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_options", columnDefinition = "jsonb")
    private List<String> customOptions;

    @Column(name = "position", nullable = false)
    private Integer position = 0;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_attribute_id", insertable = false, updatable = false)
    private VariantAttribute variantAttribute;
}
