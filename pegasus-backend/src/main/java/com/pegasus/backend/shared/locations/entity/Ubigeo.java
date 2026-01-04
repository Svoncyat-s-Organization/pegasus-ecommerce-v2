package com.pegasus.backend.shared.locations.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad Ubigeo - Sistema de ubicaciones de Perú
 * Tabla: ubigeos
 */
@Entity
@Table(name = "ubigeos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ubigeo {

    @Id
    @Column(length = 6)
    private String id;

    @Column(name = "department_name", nullable = false, length = 50)
    private String departmentName;

    @Column(name = "province_name", nullable = false, length = 50)
    private String provinceName;

    @Column(name = "district_name", nullable = false, length = 50)
    private String districtName;

    @Column(name = "department_id", length = 2, insertable = false, updatable = false)
    private String departmentId;

    @Column(name = "province_id", length = 4, insertable = false, updatable = false)
    private String provinceId;
}
