package com.pegasus.backend.features.settings.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Información legal y de identidad de la empresa
 * Singleton: Solo puede existir 1 registro (id = 1)
 */
@Entity
@Table(name = "business_info")
@Data
@EqualsAndHashCode(callSuper = true)
public class BusinessInfo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "ruc", nullable = false, length = 11)
    private String ruc;

    @Column(name = "legal_address", nullable = false, columnDefinition = "text")
    private String legalAddress;

    @Column(name = "ubigeo_id", nullable = false, length = 6)
    private String ubigeoId;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "website")
    private String website;

    @Column(name = "logo_url", columnDefinition = "text")
    private String logoUrl;

    @Column(name = "business_description", columnDefinition = "text")
    private String businessDescription;

    @Column(name = "facebook_url")
    private String facebookUrl;

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "twitter_url")
    private String twitterUrl;

    @Column(name = "tiktok_url")
    private String tiktokUrl;
}
