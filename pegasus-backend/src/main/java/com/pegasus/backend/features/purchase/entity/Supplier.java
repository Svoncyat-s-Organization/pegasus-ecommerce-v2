package com.pegasus.backend.features.purchase.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Supplier entity for Purchases module.
 */
@Entity
@Table(name = "suppliers")
@Data
@EqualsAndHashCode(callSuper = true)
public class Supplier extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 3)
    private SupplierDocumentType docType;

    @Column(name = "doc_number", nullable = false, length = 20)
    private String docNumber;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "contact_name", length = 100)
    private String contactName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "address", columnDefinition = "text")
    private String address;

    @Column(name = "ubigeo_id", length = 6)
    private String ubigeoId;
}
