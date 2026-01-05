package com.pegasus.backend.features.logistic.controller;

import com.pegasus.backend.features.logistic.dto.CreateShippingMethodRequest;
import com.pegasus.backend.features.logistic.dto.ShippingMethodResponse;
import com.pegasus.backend.features.logistic.dto.UpdateShippingMethodRequest;
import com.pegasus.backend.features.logistic.service.ShippingMethodService;
import com.pegasus.backend.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/shipping-methods")
@RequiredArgsConstructor
@Tag(name = "Shipping Methods", description = "Gestión de métodos de envío")
public class ShippingMethodController {

    private final ShippingMethodService shippingMethodService;

    @GetMapping
    @Operation(summary = "Obtener todos los métodos de envío")
    public ResponseEntity<PageResponse<ShippingMethodResponse>> getAllShippingMethods(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(shippingMethodService.getAllShippingMethods(search, isActive, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener método de envío por ID")
    public ResponseEntity<ShippingMethodResponse> getShippingMethodById(@PathVariable Long id) {
        return ResponseEntity.ok(shippingMethodService.getShippingMethodById(id));
    }

    @PostMapping
    @Operation(summary = "Crear método de envío")
    public ResponseEntity<ShippingMethodResponse> createShippingMethod(
            @Valid @RequestBody CreateShippingMethodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shippingMethodService.createShippingMethod(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar método de envío")
    public ResponseEntity<ShippingMethodResponse> updateShippingMethod(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShippingMethodRequest request) {
        return ResponseEntity.ok(shippingMethodService.updateShippingMethod(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar método de envío (soft delete)")
    public ResponseEntity<Void> deleteShippingMethod(@PathVariable Long id) {
        shippingMethodService.deleteShippingMethod(id);
        return ResponseEntity.noContent().build();
    }
}
