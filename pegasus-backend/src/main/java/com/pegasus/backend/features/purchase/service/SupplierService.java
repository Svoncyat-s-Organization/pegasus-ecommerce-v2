package com.pegasus.backend.features.purchase.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.purchase.dto.CreateSupplierRequest;
import com.pegasus.backend.features.purchase.dto.SupplierResponse;
import com.pegasus.backend.features.purchase.dto.UpdateSupplierRequest;
import com.pegasus.backend.features.purchase.entity.Supplier;
import com.pegasus.backend.features.purchase.entity.SupplierDocumentType;
import com.pegasus.backend.features.purchase.mapper.SupplierMapper;
import com.pegasus.backend.features.purchase.repository.SupplierRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.locations.repository.UbigeoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final UbigeoRepository ubigeoRepository;

    public PageResponse<SupplierResponse> getAll(String search, Pageable pageable) {
        Page<Supplier> page = (search != null && !search.isBlank())
                ? supplierRepository.search(search.trim(), pageable)
                : supplierRepository.findAll(pageable);

        List<SupplierResponse> content = page.getContent().stream()
                .map(supplierMapper::toResponse)
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

    public SupplierResponse getById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));
        return supplierMapper.toResponse(supplier);
    }

    @Transactional
    public SupplierResponse create(CreateSupplierRequest request) {
        log.info("Creating supplier: {}", request.companyName());

        validateSupplierDoc(request.docType(), request.docNumber());
        validateUbigeoIfPresent(request.ubigeoId());

        if (supplierRepository.existsByDocNumber(request.docNumber())) {
            throw new IllegalArgumentException("El número de documento ya está registrado");
        }

        Supplier supplier = supplierMapper.toEntity(request);
        Supplier saved = supplierRepository.save(supplier);
        return supplierMapper.toResponse(saved);
    }

    @Transactional
    public SupplierResponse update(Long id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));

        SupplierDocumentType docType = request.docType() != null ? request.docType() : supplier.getDocType();
        String docNumber = request.docNumber() != null ? request.docNumber() : supplier.getDocNumber();
        validateSupplierDoc(docType, docNumber);
        validateUbigeoIfPresent(request.ubigeoId());

        if (request.docNumber() != null && !request.docNumber().equals(supplier.getDocNumber())) {
            if (supplierRepository.existsByDocNumber(request.docNumber())) {
                throw new IllegalArgumentException("El número de documento ya está registrado");
            }
        }

        supplierMapper.updateEntity(request, supplier);
        Supplier updated = supplierRepository.save(supplier);
        return supplierMapper.toResponse(updated);
    }

    @Transactional
    public void toggleStatus(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));

        supplier.setIsActive(!supplier.getIsActive());
        supplierRepository.save(supplier);
    }

    @Transactional
    public void delete(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Proveedor no encontrado con id: " + id);
        }
        supplierRepository.deleteById(id);
    }

    private void validateUbigeoIfPresent(String ubigeoId) {
        if (ubigeoId == null || ubigeoId.isBlank()) {
            return;
        }
        if (!ubigeoRepository.existsById(ubigeoId)) {
            throw new IllegalArgumentException("Ubigeo inválido");
        }
    }

    private void validateSupplierDoc(SupplierDocumentType docType, String docNumber) {
        if (docType == null || docNumber == null || docNumber.isBlank()) {
            throw new IllegalArgumentException("Tipo y número de documento son requeridos");
        }
        String normalized = docNumber.trim();

        boolean isValid = switch (docType) {
            case DNI -> normalized.matches("^\\d{8}$");
            case RUC -> normalized.matches("^\\d{11}$");
        };

        if (!isValid) {
            throw new IllegalArgumentException(
                    docType == SupplierDocumentType.DNI
                            ? "DNI debe tener exactamente 8 dígitos"
                            : "RUC debe tener exactamente 11 dígitos"
            );
        }
    }
}
