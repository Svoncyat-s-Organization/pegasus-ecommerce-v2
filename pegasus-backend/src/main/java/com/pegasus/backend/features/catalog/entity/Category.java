package com.pegasus.backend.features.catalog.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Entidad Category (Categoría)
 * Soporta jerarquía de categorías mediante parent_id (self-referential)
 */
@Entity
@Table(name = "categories")
@Data
@EqualsAndHashCode(callSuper = true)
public class Category extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column(name = "slug", nullable = false, unique = true, columnDefinition = "TEXT")
    private String slug;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "parent_id")
    private Long parentId;

    // Self-referential relationship (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Category parent;
}
