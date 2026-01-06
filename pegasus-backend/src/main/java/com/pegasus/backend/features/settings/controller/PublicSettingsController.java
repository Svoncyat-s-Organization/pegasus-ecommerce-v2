package com.pegasus.backend.features.settings.controller;

import com.pegasus.backend.features.settings.dto.StorefrontSettingsResponse;
import com.pegasus.backend.features.settings.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador público para configuración del storefront (sin autenticación)
 */
@RestController
@RequestMapping("/api/public/settings")
@RequiredArgsConstructor
@Tag(name = "Settings (Public)", description = "Configuración pública del storefront")
public class PublicSettingsController {

    private final SettingsService settingsService;

    @GetMapping("/storefront")
    @Operation(summary = "Obtener configuración pública del storefront")
    public ResponseEntity<StorefrontSettingsResponse> getStorefrontSettings() {
        return ResponseEntity.ok(settingsService.getStorefrontSettings());
    }
}
