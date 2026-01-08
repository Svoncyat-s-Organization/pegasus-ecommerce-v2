package com.pegasus.backend.features.catalog.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

/**
 * Entidad VariantAttribute
 * Catálogo global de atributos de variantes (color, tamaño, almacenamiento, etc.)
 * Estos atributos son reutilizables en cualquier producto.
 */
@Entity
@Table(name = "variant_attributes")
@Data
@EqualsAndHashCode(callSuper = true)
public class VariantAttribute extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "attribute_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AttributeType attributeType = AttributeType.TEXT;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options", nullable = false, columnDefinition = "jsonb")
    private List<String> options = new ArrayList<>();

    @Column(name = "description", length = 255)
    private String description;

    /**
     * Tipos de atributo soportados
     * Sirven como hint para la UI
     */
    public enum AttributeType {
        TEXT,   // Texto simple
        COLOR,  // Selector de color / swatches
        SIZE,   // Tabla de tallas
        NUMBER  // Valores numéricos
    }
}
