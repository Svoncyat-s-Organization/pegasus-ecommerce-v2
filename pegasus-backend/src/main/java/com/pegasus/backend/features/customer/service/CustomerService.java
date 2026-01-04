package com.pegasus.backend.features.customer.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.customer.dto.*;
import com.pegasus.backend.features.customer.entity.Customer;
import com.pegasus.backend.features.customer.entity.CustomerAddress;
import com.pegasus.backend.features.customer.mapper.CustomerMapper;
import com.pegasus.backend.features.customer.repository.CustomerAddressRepository;
import com.pegasus.backend.features.customer.repository.CustomerRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestión de Customers
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Obtener todos los clientes con paginación
     */
    public PageResponse<CustomerResponse> getAllCustomers(Pageable pageable) {
        log.debug("Fetching all customers with pagination: {}", pageable);
        Page<Customer> page = customerRepository.findAll(pageable);
        
        List<CustomerResponse> content = page.getContent().stream()
                .map(customerMapper::toResponse)
                .toList();
        
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    /**
     * Obtener cliente por ID
     */
    public CustomerResponse getCustomerById(Long id) {
        log.debug("Fetching customer with id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        return customerMapper.toResponse(customer);
    }

    /**
     * Crear nuevo cliente
     */
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        log.info("Creating customer: {}", request.getEmail());
        
        // Validar duplicados
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado");
        }
        if (customerRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya está registrado");
        }
        
        Customer customer = customerMapper.toEntity(request);
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        Customer saved = customerRepository.save(customer);
        log.info("Customer created successfully: {}", saved.getEmail());
        
        return customerMapper.toResponse(saved);
    }

    /**
     * Actualizar cliente
     */
    @Transactional
    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        log.info("Updating customer with id: {}", id);
        
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        
        // Validar duplicados si se cambia email o username
        if (request.getEmail() != null && !request.getEmail().equals(customer.getEmail())) {
            if (customerRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("El correo electrónico ya está registrado");
            }
        }
        if (request.getUsername() != null && !request.getUsername().equals(customer.getUsername())) {
            if (customerRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("El nombre de usuario ya está registrado");
            }
        }
        
        customerMapper.updateEntity(request, customer);
        Customer updated = customerRepository.save(customer);
        
        log.info("Customer updated successfully: {}", updated.getEmail());
        return customerMapper.toResponse(updated);
    }

    /**
     * Eliminar cliente (soft delete)
     */
    @Transactional
    public void deleteCustomer(Long id) {
        log.info("Soft deleting customer with id: {}", id);
        
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        
        customer.setIsActive(false);
        customerRepository.save(customer);
        
        log.info("Customer soft deleted successfully: {}", customer.getEmail());
    }

    /**
     * Toggle estado activo del cliente
     */
    @Transactional
    public CustomerResponse toggleCustomerStatus(Long id) {
        log.info("Toggling status for customer with id: {}", id);
        
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        
        customer.setIsActive(!customer.getIsActive());
        Customer updated = customerRepository.save(customer);
        
        log.info("Customer status toggled successfully: {} -> {}", customer.getEmail(), updated.getIsActive());
        return customerMapper.toResponse(updated);
    }

    // ==================== DIRECCIONES ====================

    /**
     * Obtener todas las direcciones de un cliente
     */
    public List<CustomerAddressResponse> getCustomerAddresses(Long customerId) {
        log.debug("Fetching addresses for customer: {}", customerId);
        
        // Verificar que el cliente existe
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Cliente no encontrado con id: " + customerId);
        }
        
        return addressRepository.findByCustomerId(customerId).stream()
                .map(customerMapper::toAddressResponse)
                .toList();
    }

    /**
     * Crear nueva dirección para un cliente
     */
    @Transactional
    public CustomerAddressResponse createAddress(Long customerId, CreateCustomerAddressRequest request) {
        log.info("Creating address for customer: {}", customerId);
        
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + customerId));
        
        CustomerAddress address = customerMapper.toAddressEntity(request);
        address.setCustomer(customer);
        
        // Si se marca como default, desmarcar las demás
        if (Boolean.TRUE.equals(request.getIsDefaultShipping())) {
            addressRepository.clearDefaultShipping(customerId);
            address.setIsDefaultShipping(true);
        } else {
            address.setIsDefaultShipping(false);
        }
        
        if (Boolean.TRUE.equals(request.getIsDefaultBilling())) {
            addressRepository.clearDefaultBilling(customerId);
            address.setIsDefaultBilling(true);
        } else {
            address.setIsDefaultBilling(false);
        }
        
        CustomerAddress saved = addressRepository.save(address);
        log.info("Address created successfully for customer: {}", customerId);
        
        return customerMapper.toAddressResponse(saved);
    }

    /**
     * Actualizar dirección
     */
    @Transactional
    public CustomerAddressResponse updateAddress(Long customerId, Long addressId, UpdateCustomerAddressRequest request) {
        log.info("Updating address {} for customer: {}", addressId, customerId);
        
        CustomerAddress address = addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Dirección no encontrada con id: " + addressId + " para el cliente: " + customerId));
        
        customerMapper.updateAddressEntity(request, address);
        CustomerAddress updated = addressRepository.save(address);
        
        log.info("Address updated successfully: {}", addressId);
        return customerMapper.toAddressResponse(updated);
    }

    /**
     * Eliminar dirección
     */
    @Transactional
    public void deleteAddress(Long customerId, Long addressId) {
        log.info("Deleting address {} for customer: {}", addressId, customerId);
        
        CustomerAddress address = addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Dirección no encontrada con id: " + addressId + " para el cliente: " + customerId));
        
        addressRepository.delete(address);
        log.info("Address deleted successfully: {}", addressId);
    }

    /**
     * Establecer dirección como default shipping
     */
    @Transactional
    public CustomerAddressResponse setDefaultShipping(Long customerId, Long addressId) {
        log.info("Setting address {} as default shipping for customer: {}", addressId, customerId);
        
        CustomerAddress address = addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Dirección no encontrada con id: " + addressId + " para el cliente: " + customerId));
        
        // Desmarcar todas las demás
        addressRepository.clearDefaultShipping(customerId);
        
        // Marcar esta como default
        address.setIsDefaultShipping(true);
        CustomerAddress updated = addressRepository.save(address);
        
        log.info("Address set as default shipping: {}", addressId);
        return customerMapper.toAddressResponse(updated);
    }

    /**
     * Establecer dirección como default billing
     */
    @Transactional
    public CustomerAddressResponse setDefaultBilling(Long customerId, Long addressId) {
        log.info("Setting address {} as default billing for customer: {}", addressId, customerId);
        
        CustomerAddress address = addressRepository.findByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Dirección no encontrada con id: " + addressId + " para el cliente: " + customerId));
        
        // Desmarcar todas las demás
        addressRepository.clearDefaultBilling(customerId);
        
        // Marcar esta como default
        address.setIsDefaultBilling(true);
        CustomerAddress updated = addressRepository.save(address);
        
        log.info("Address set as default billing: {}", addressId);
        return customerMapper.toAddressResponse(updated);
    }
}
