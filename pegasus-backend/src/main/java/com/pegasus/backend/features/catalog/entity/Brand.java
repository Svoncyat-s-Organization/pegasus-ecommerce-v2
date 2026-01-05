package com.pegasus.backend.features.catalog.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Entidad Brand (Marca)
 * Representa las marcas de productos en el catálogo
 */
@Entity
@Table(name = "brands")
@Data
@EqualsAndHashCode(callSuper = true)
public class Brand extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50, unique = true)
    private String name;

    @Column(name = "slug", nullable = false, length = 50, unique = true)
    private String slug;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;
}
