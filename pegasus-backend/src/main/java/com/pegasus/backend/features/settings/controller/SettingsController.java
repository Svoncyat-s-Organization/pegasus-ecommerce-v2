package com.pegasus.backend.features.settings.controller;

import com.pegasus.backend.features.settings.dto.*;
import com.pegasus.backend.features.settings.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador para gestión de configuración (Backoffice)
 */
@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@Tag(name = "Settings (Admin)", description = "Gestión de configuración del sistema")
public class SettingsController {

    private final SettingsService settingsService;

    // ==================== BUSINESS INFO ====================

    @GetMapping("/business")
    @Operation(summary = "Obtener información de la empresa")
    public ResponseEntity<BusinessInfoResponse> getBusinessInfo() {
        return ResponseEntity.ok(settingsService.getBusinessInfo());
    }

    @PutMapping("/business")
    @Operation(summary = "Actualizar información de la empresa")
    public ResponseEntity<BusinessInfoResponse> updateBusinessInfo(
            @Valid @RequestBody UpdateBusinessInfoRequest request) {
        return ResponseEntity.ok(settingsService.updateBusinessInfo(request));
    }

    // ==================== STOREFRONT SETTINGS ====================

    @GetMapping("/storefront")
    @Operation(summary = "Obtener configuración del storefront")
    public ResponseEntity<StorefrontSettingsResponse> getStorefrontSettings() {
        return ResponseEntity.ok(settingsService.getStorefrontSettings());
    }

    @PutMapping("/storefront")
    @Operation(summary = "Actualizar configuración del storefront")
    public ResponseEntity<StorefrontSettingsResponse> updateStorefrontSettings(
            @Valid @RequestBody UpdateStorefrontSettingsRequest request) {
        return ResponseEntity.ok(settingsService.updateStorefrontSettings(request));
    }
}
