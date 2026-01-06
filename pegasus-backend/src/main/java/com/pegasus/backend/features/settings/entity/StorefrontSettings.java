package com.pegasus.backend.features.settings.entity;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Configuración de la tienda online (storefront)
 * Singleton: Solo puede existir 1 registro (id = 1)
 */
@Entity
@Table(name = "storefront_settings")
@Data
@EqualsAndHashCode(callSuper = true)
public class StorefrontSettings extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "storefront_name", nullable = false)
    private String storefrontName;

    @Column(name = "logo_url", columnDefinition = "text")
    private String logoUrl;

    @Column(name = "favicon_url", columnDefinition = "text")
    private String faviconUrl;

    @Column(name = "primary_color", nullable = false, length = 7)
    private String primaryColor = "#04213b";

    @Column(name = "secondary_color", nullable = false, length = 7)
    private String secondaryColor = "#f2f2f2";

    @Column(name = "terms_and_conditions", columnDefinition = "text")
    private String termsAndConditions;

    @Column(name = "privacy_policy", columnDefinition = "text")
    private String privacyPolicy;

    @Column(name = "return_policy", columnDefinition = "text")
    private String returnPolicy;

    @Column(name = "shipping_policy", columnDefinition = "text")
    private String shippingPolicy;

    @Column(name = "support_email")
    private String supportEmail;

    @Column(name = "support_phone", length = 20)
    private String supportPhone;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;
}
