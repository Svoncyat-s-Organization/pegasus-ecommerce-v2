package com.pegasus.backend.features.customer.controller;

import com.pegasus.backend.features.customer.dto.*;
import com.pegasus.backend.features.customer.service.CustomerService;
import com.pegasus.backend.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de Customers (Backoffice)
 */
@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Gestión de clientes del storefront")
public class CustomerController {

    private final CustomerService customerService;

    /**
     * GET /api/admin/customers
     * Listar todos los clientes con paginación
     */
    @GetMapping
    @Operation(
            summary = "Listar clientes",
            description = "Obtiene todos los clientes con paginación"
    )
    @ApiResponse(responseCode = "200", description = "Lista de clientes obtenida exitosamente")
    public ResponseEntity<PageResponse<CustomerResponse>> getAllCustomers(
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<CustomerResponse> response = customerService.getAllCustomers(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/customers/{id}
     * Obtener cliente por ID
     */
    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener cliente por ID",
            description = "Obtiene los detalles de un cliente específico"
    )
    @ApiResponse(responseCode = "200", description = "Cliente encontrado")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        CustomerResponse response = customerService.getCustomerById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/customers
     * Crear nuevo cliente
     */
    @PostMapping
    @Operation(
            summary = "Crear cliente",
            description = "Crea un nuevo cliente en el sistema"
    )
    @ApiResponse(responseCode = "201", description = "Cliente creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o email/username duplicado")
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {
        CustomerResponse response = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/admin/customers/{id}
     * Actualizar cliente
     */
    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar cliente",
            description = "Actualiza los datos de un cliente existente"
    )
    @ApiResponse(responseCode = "200", description = "Cliente actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o email/username duplicado")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request) {
        CustomerResponse response = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/customers/{id}
     * Eliminar cliente (soft delete)
     */
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Eliminar cliente",
            description = "Desactiva un cliente (soft delete)"
    )
    @ApiResponse(responseCode = "204", description = "Cliente eliminado exitosamente")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/admin/customers/{id}/toggle-status
     * Toggle estado activo/inactivo del cliente
     */
    @PutMapping("/{id}/toggle-status")
    @Operation(
            summary = "Toggle estado del cliente",
            description = "Alterna el estado activo/inactivo de un cliente"
    )
    @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    public ResponseEntity<CustomerResponse> toggleCustomerStatus(@PathVariable Long id) {
        CustomerResponse response = customerService.toggleCustomerStatus(id);
        return ResponseEntity.ok(response);
    }

    // ==================== DIRECCIONES ====================

    /**
     * GET /api/admin/customers/{customerId}/addresses
     * Obtener todas las direcciones de un cliente
     */
    @GetMapping("/{customerId}/addresses")
    @Operation(
            summary = "Listar direcciones del cliente",
            description = "Obtiene todas las direcciones de un cliente específico"
    )
    @ApiResponse(responseCode = "200", description = "Direcciones obtenidas exitosamente")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    public ResponseEntity<List<CustomerAddressResponse>> getCustomerAddresses(
            @PathVariable Long customerId) {
        List<CustomerAddressResponse> addresses = customerService.getCustomerAddresses(customerId);
        return ResponseEntity.ok(addresses);
    }

    /**
     * POST /api/admin/customers/{customerId}/addresses
     * Crear nueva dirección para un cliente
     */
    @PostMapping("/{customerId}/addresses")
    @Operation(
            summary = "Crear dirección",
            description = "Agrega una nueva dirección para un cliente"
    )
    @ApiResponse(responseCode = "201", description = "Dirección creada exitosamente")
    @ApiResponse(responseCode = "404", description = "Cliente no encontrado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<CustomerAddressResponse> createAddress(
            @PathVariable Long customerId,
            @Valid @RequestBody CreateCustomerAddressRequest request) {
        CustomerAddressResponse response = customerService.createAddress(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/admin/customers/{customerId}/addresses/{addressId}
     * Actualizar dirección
     */
    @PutMapping("/{customerId}/addresses/{addressId}")
    @Operation(
            summary = "Actualizar dirección",
            description = "Actualiza los datos de una dirección existente"
    )
    @ApiResponse(responseCode = "200", description = "Dirección actualizada exitosamente")
    @ApiResponse(responseCode = "404", description = "Dirección o cliente no encontrado")
    public ResponseEntity<CustomerAddressResponse> updateAddress(
            @PathVariable Long customerId,
            @PathVariable Long addressId,
            @Valid @RequestBody UpdateCustomerAddressRequest request) {
        CustomerAddressResponse response = customerService.updateAddress(customerId, addressId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/admin/customers/{customerId}/addresses/{addressId}
     * Eliminar dirección
     */
    @DeleteMapping("/{customerId}/addresses/{addressId}")
    @Operation(
            summary = "Eliminar dirección",
            description = "Elimina una dirección de un cliente"
    )
    @ApiResponse(responseCode = "204", description = "Dirección eliminada exitosamente")
    @ApiResponse(responseCode = "404", description = "Dirección o cliente no encontrado")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long customerId,
            @PathVariable Long addressId) {
        customerService.deleteAddress(customerId, addressId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/admin/customers/{customerId}/addresses/{addressId}/set-default-shipping
     * Establecer dirección como default shipping
     */
    @PutMapping("/{customerId}/addresses/{addressId}/set-default-shipping")
    @Operation(
            summary = "Establecer dirección de envío por defecto",
            description = "Marca una dirección como la predeterminada para envíos"
    )
    @ApiResponse(responseCode = "200", description = "Dirección marcada como default shipping")
    @ApiResponse(responseCode = "404", description = "Dirección o cliente no encontrado")
    public ResponseEntity<CustomerAddressResponse> setDefaultShipping(
            @PathVariable Long customerId,
            @PathVariable Long addressId) {
        CustomerAddressResponse response = customerService.setDefaultShipping(customerId, addressId);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/customers/{customerId}/addresses/{addressId}/set-default-billing
     * Establecer dirección como default billing
     */
    @PutMapping("/{customerId}/addresses/{addressId}/set-default-billing")
    @Operation(
            summary = "Establecer dirección de facturación por defecto",
            description = "Marca una dirección como la predeterminada para facturación"
    )
    @ApiResponse(responseCode = "200", description = "Dirección marcada como default billing")
    @ApiResponse(responseCode = "404", description = "Dirección o cliente no encontrado")
    public ResponseEntity<CustomerAddressResponse> setDefaultBilling(
            @PathVariable Long customerId,
            @PathVariable Long addressId) {
        CustomerAddressResponse response = customerService.setDefaultBilling(customerId, addressId);
        return ResponseEntity.ok(response);
    }
}
