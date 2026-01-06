package com.pegasus.backend.features.storefront.controller;

import com.pegasus.backend.features.customer.dto.*;
import com.pegasus.backend.features.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión del perfil del Customer autenticado
 * Endpoints protegidos que requieren rol CUSTOMER
 */
@RestController
@RequestMapping("/api/storefront/profile")
@RequiredArgsConstructor
@Tag(name = "Storefront Profile", description = "Gestión del perfil del cliente autenticado")
public class StorefrontProfileController {

    private final CustomerService customerService;

    // ==================== PROFILE ====================

    @GetMapping
    @Operation(
            summary = "Obtener mi perfil",
            description = "Obtiene los datos del perfil del cliente autenticado"
    )
    @ApiResponse(responseCode = "200", description = "Perfil obtenido exitosamente")
    public ResponseEntity<CustomerResponse> getMyProfile(Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        CustomerResponse response = customerService.getCustomerById(customerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    @Operation(
            summary = "Actualizar mi perfil",
            description = "Actualiza los datos del perfil del cliente autenticado"
    )
    @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<CustomerResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateCustomerRequest request) {
        Long customerId = (Long) authentication.getPrincipal();
        CustomerResponse response = customerService.updateCustomer(customerId, request);
        return ResponseEntity.ok(response);
    }

    // ==================== ADDRESSES ====================

    @GetMapping("/addresses")
    @Operation(
            summary = "Listar mis direcciones",
            description = "Obtiene todas las direcciones del cliente autenticado"
    )
    @ApiResponse(responseCode = "200", description = "Direcciones obtenidas exitosamente")
    public ResponseEntity<List<CustomerAddressResponse>> getMyAddresses(Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        List<CustomerAddressResponse> addresses = customerService.getCustomerAddresses(customerId);
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/addresses")
    @Operation(
            summary = "Crear dirección",
            description = "Agrega una nueva dirección para el cliente autenticado"
    )
    @ApiResponse(responseCode = "201", description = "Dirección creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<CustomerAddressResponse> createMyAddress(
            Authentication authentication,
            @Valid @RequestBody CreateCustomerAddressRequest request) {
        Long customerId = (Long) authentication.getPrincipal();
        CustomerAddressResponse response = customerService.createAddress(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/addresses/{addressId}")
    @Operation(
            summary = "Actualizar dirección",
            description = "Actualiza los datos de una dirección del cliente autenticado"
    )
    @ApiResponse(responseCode = "200", description = "Dirección actualizada exitosamente")
    @ApiResponse(responseCode = "404", description = "Dirección no encontrada")
    public ResponseEntity<CustomerAddressResponse> updateMyAddress(
            Authentication authentication,
            @PathVariable Long addressId,
            @Valid @RequestBody UpdateCustomerAddressRequest request) {
        Long customerId = (Long) authentication.getPrincipal();
        CustomerAddressResponse response = customerService.updateAddress(customerId, addressId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/addresses/{addressId}")
    @Operation(
            summary = "Eliminar dirección",
            description = "Elimina una dirección del cliente autenticado"
    )
    @ApiResponse(responseCode = "204", description = "Dirección eliminada exitosamente")
    @ApiResponse(responseCode = "404", description = "Dirección no encontrada")
    public ResponseEntity<Void> deleteMyAddress(
            Authentication authentication,
            @PathVariable Long addressId) {
        Long customerId = (Long) authentication.getPrincipal();
        customerService.deleteAddress(customerId, addressId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/addresses/{addressId}/set-default-shipping")
    @Operation(
            summary = "Establecer dirección de envío por defecto",
            description = "Marca una dirección como la predeterminada para envíos"
    )
    @ApiResponse(responseCode = "200", description = "Dirección marcada como default shipping")
    @ApiResponse(responseCode = "404", description = "Dirección no encontrada")
    public ResponseEntity<CustomerAddressResponse> setMyDefaultShipping(
            Authentication authentication,
            @PathVariable Long addressId) {
        Long customerId = (Long) authentication.getPrincipal();
        CustomerAddressResponse response = customerService.setDefaultShipping(customerId, addressId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/addresses/{addressId}/set-default-billing")
    @Operation(
            summary = "Establecer dirección de facturación por defecto",
            description = "Marca una dirección como la predeterminada para facturación"
    )
    @ApiResponse(responseCode = "200", description = "Dirección marcada como default billing")
    @ApiResponse(responseCode = "404", description = "Dirección no encontrada")
    public ResponseEntity<CustomerAddressResponse> setMyDefaultBilling(
            Authentication authentication,
            @PathVariable Long addressId) {
        Long customerId = (Long) authentication.getPrincipal();
        CustomerAddressResponse response = customerService.setDefaultBilling(customerId, addressId);
        return ResponseEntity.ok(response);
    }
}
