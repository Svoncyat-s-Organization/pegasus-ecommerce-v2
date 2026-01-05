package com.pegasus.backend.features.storefront.controller;

import com.pegasus.backend.features.logistic.dto.ShippingMethodResponse;
import com.pegasus.backend.features.logistic.service.ShippingMethodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para endpoints públicos del Storefront
 * No requiere autenticación
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Tag(name = "Public Storefront", description = "Endpoints públicos para el storefront")
public class PublicStorefrontController {

    private final ShippingMethodService shippingMethodService;

    @GetMapping("/shipping-methods")
    @Operation(
            summary = "Obtener métodos de envío activos",
            description = "Lista de métodos de envío disponibles para el checkout"
    )
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<List<ShippingMethodResponse>> getActiveShippingMethods() {
        List<ShippingMethodResponse> methods = shippingMethodService.getActiveShippingMethods();
        return ResponseEntity.ok(methods);
    }
}
