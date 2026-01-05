package com.pegasus.backend.features.inventory.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entidad Warehouse (Almacén)
 * Representa un almacén físico donde se almacenan productos
 */
@Entity
@Table(name = "warehouses")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "ubigeo_id", nullable = false, length = 6)
    private String ubigeoId;

    @Column(name = "address", nullable = false, length = 255)
    private String address;
}
