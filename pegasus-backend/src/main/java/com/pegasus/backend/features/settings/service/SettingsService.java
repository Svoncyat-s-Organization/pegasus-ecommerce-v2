package com.pegasus.backend.features.settings.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.settings.dto.*;
import com.pegasus.backend.features.settings.entity.BusinessInfo;
import com.pegasus.backend.features.settings.entity.StorefrontSettings;
import com.pegasus.backend.features.settings.repository.BusinessInfoRepository;
import com.pegasus.backend.features.settings.repository.StorefrontSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para gestión de configuración del sistema
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SettingsService {

    private final BusinessInfoRepository businessInfoRepository;
    private final StorefrontSettingsRepository storefrontSettingsRepository;

    // ==================== BUSINESS INFO ====================

    /**
     * Obtiene la información de la empresa
     */
    public BusinessInfoResponse getBusinessInfo() {
        log.debug("Fetching business info");
        BusinessInfo info = businessInfoRepository.findSingleton()
                .orElseThrow(() -> new ResourceNotFoundException("Información de empresa no configurada"));
        return toBusinessInfoResponse(info);
    }

    /**
     * Actualiza la información de la empresa
     */
    @Transactional
    public BusinessInfoResponse updateBusinessInfo(UpdateBusinessInfoRequest request) {
        log.info("Updating business info");
        
        BusinessInfo info = businessInfoRepository.findSingleton()
                .orElseGet(this::createDefaultBusinessInfo);
        
        info.setBusinessName(request.businessName());
        info.setRuc(request.ruc());
        info.setLegalAddress(request.legalAddress());
        info.setUbigeoId(request.ubigeoId());
        info.setPhone(request.phone());
        info.setEmail(request.email());
        info.setWebsite(request.website());
        info.setLogoUrl(request.logoUrl());
        info.setBusinessDescription(request.businessDescription());
        info.setFacebookUrl(request.facebookUrl());
        info.setInstagramUrl(request.instagramUrl());
        info.setTwitterUrl(request.twitterUrl());
        info.setTiktokUrl(request.tiktokUrl());
        
        BusinessInfo saved = businessInfoRepository.save(info);
        log.info("Business info updated successfully");
        return toBusinessInfoResponse(saved);
    }

    private BusinessInfo createDefaultBusinessInfo() {
        BusinessInfo info = new BusinessInfo();
        info.setBusinessName("Pegasus E-commerce");
        info.setRuc("20123456789");
        info.setLegalAddress("Lima, Perú");
        info.setUbigeoId("150101");
        info.setPhone("999999999");
        info.setEmail("contacto@pegasus.pe");
        info.setIsActive(true);
        return info;
    }

    private BusinessInfoResponse toBusinessInfoResponse(BusinessInfo info) {
        return new BusinessInfoResponse(
                info.getId(),
                info.getBusinessName(),
                info.getRuc(),
                info.getLegalAddress(),
                info.getUbigeoId(),
                info.getPhone(),
                info.getEmail(),
                info.getWebsite(),
                info.getLogoUrl(),
                info.getBusinessDescription(),
                info.getFacebookUrl(),
                info.getInstagramUrl(),
                info.getTwitterUrl(),
                info.getTiktokUrl(),
                info.getIsActive(),
                info.getUpdatedAt()
        );
    }

    // ==================== STOREFRONT SETTINGS ====================

    /**
     * Obtiene la configuración del storefront
     */
    public StorefrontSettingsResponse getStorefrontSettings() {
        log.debug("Fetching storefront settings");
        StorefrontSettings settings = storefrontSettingsRepository.findSingleton()
                .orElseThrow(() -> new ResourceNotFoundException("Configuración de tienda no configurada"));
        return toStorefrontSettingsResponse(settings);
    }

    /**
     * Actualiza la configuración del storefront
     */
    @Transactional
    public StorefrontSettingsResponse updateStorefrontSettings(UpdateStorefrontSettingsRequest request) {
        log.info("Updating storefront settings");
        
        StorefrontSettings settings = storefrontSettingsRepository.findSingleton()
                .orElseGet(this::createDefaultStorefrontSettings);
        
        settings.setStorefrontName(request.storefrontName());
        settings.setLogoUrl(request.logoUrl());
        settings.setFaviconUrl(request.faviconUrl());
        settings.setPrimaryColor(request.primaryColor());
        settings.setSecondaryColor(request.secondaryColor());
        settings.setTermsAndConditions(request.termsAndConditions());
        settings.setPrivacyPolicy(request.privacyPolicy());
        settings.setReturnPolicy(request.returnPolicy());
        settings.setShippingPolicy(request.shippingPolicy());
        settings.setSupportEmail(request.supportEmail());
        settings.setSupportPhone(request.supportPhone());
        settings.setWhatsappNumber(request.whatsappNumber());
        
        StorefrontSettings saved = storefrontSettingsRepository.save(settings);
        log.info("Storefront settings updated successfully");
        return toStorefrontSettingsResponse(saved);
    }

    private StorefrontSettings createDefaultStorefrontSettings() {
        StorefrontSettings settings = new StorefrontSettings();
        settings.setStorefrontName("Pegasus Store");
        settings.setPrimaryColor("#04213b");
        settings.setSecondaryColor("#f2f2f2");
        settings.setIsActive(true);
        return settings;
    }

    private StorefrontSettingsResponse toStorefrontSettingsResponse(StorefrontSettings settings) {
        return new StorefrontSettingsResponse(
                settings.getId(),
                settings.getStorefrontName(),
                settings.getLogoUrl(),
                settings.getFaviconUrl(),
                settings.getPrimaryColor(),
                settings.getSecondaryColor(),
                settings.getTermsAndConditions(),
                settings.getPrivacyPolicy(),
                settings.getReturnPolicy(),
                settings.getShippingPolicy(),
                settings.getSupportEmail(),
                settings.getSupportPhone(),
                settings.getWhatsappNumber(),
                settings.getIsActive(),
                settings.getUpdatedAt()
        );
    }
}
