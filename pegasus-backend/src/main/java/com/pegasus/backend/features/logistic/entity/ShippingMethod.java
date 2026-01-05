package com.pegasus.backend.features.logistic.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Entity
@Table(name = "shipping_methods")
@Data
@EqualsAndHashCode(callSuper = true)
public class ShippingMethod extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "carrier", nullable = false, length = 100)
    private String carrier;

    @Column(name = "estimated_days_min", nullable = false)
    private Integer estimatedDaysMin;

    @Column(name = "estimated_days_max", nullable = false)
    private Integer estimatedDaysMax;

    @Column(name = "base_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseCost;

    @Column(name = "cost_per_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal costPerKg;
}
