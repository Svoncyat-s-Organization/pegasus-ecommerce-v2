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
 * Entidad CategorySpecification
 * Define los campos de especificación para productos dentro de una categoría.
 * Las especificaciones se heredan de categorías padre a hijas.
 */
@Entity
@Table(name = "category_specifications")
@Data
@EqualsAndHashCode(callSuper = true)
public class CategorySpecification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "spec_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SpecType specType = SpecType.TEXT;

    @Column(name = "unit", length = 20)
    private String unit;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options", columnDefinition = "jsonb")
    private List<String> options;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "position", nullable = false)
    private Integer position = 0;

    // Relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;

    /**
     * Tipos de especificación soportados
     */
    public enum SpecType {
        TEXT,       // Texto libre
        NUMBER,     // Numérico con unidad opcional
        SELECT,     // Dropdown desde options
        BOOLEAN     // Sí/No
    }
}
