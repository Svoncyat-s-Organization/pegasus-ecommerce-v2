package com.pegasus.backend.features.invoice.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.invoice.dto.CreateInvoiceRequest;
import com.pegasus.backend.features.invoice.dto.InvoiceResponse;
import com.pegasus.backend.features.invoice.dto.InvoiceSummaryResponse;
import com.pegasus.backend.features.invoice.dto.UpdateInvoiceStatusRequest;
import com.pegasus.backend.features.invoice.entity.Invoice;
import com.pegasus.backend.features.invoice.entity.InvoiceStatus;
import com.pegasus.backend.features.invoice.mapper.InvoiceMapper;
import com.pegasus.backend.features.invoice.repository.InvoiceRepository;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final InvoiceMapper invoiceMapper;

    public PageResponse<InvoiceSummaryResponse> getAll(String search, InvoiceStatus status, Pageable pageable) {
        Page<Invoice> page;
        boolean hasSearch = search != null && !search.isBlank();

        if (hasSearch && status != null) {
            page = invoiceRepository.searchByStatus(search.trim(), status, pageable);
        } else if (hasSearch) {
            page = invoiceRepository.search(search.trim(), pageable);
        } else if (status != null) {
            page = invoiceRepository.findByStatus(status, pageable);
        } else {
            page = invoiceRepository.findAll(pageable);
        }

        List<InvoiceSummaryResponse> content = invoiceMapper.toSummaryResponseList(page.getContent());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    public InvoiceResponse getById(Long id) {
        Invoice invoice = findById(id);
        return invoiceMapper.toResponse(invoice);
    }

    public InvoiceResponse getByOrderId(Long orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Comprobante no encontrado para orderId: " + orderId));
        return invoiceMapper.toResponse(invoice);
    }

    public InvoiceResponse getBySeriesAndNumber(String series, String number) {
        Invoice invoice = invoiceRepository.findBySeriesAndNumber(series, number)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Comprobante no encontrado con serie/número: " + series + "-" + number));
        return invoiceMapper.toResponse(invoice);
    }

    @Transactional
    public InvoiceResponse create(CreateInvoiceRequest request) {
        if (!orderRepository.existsById(request.orderId())) {
            throw new ResourceNotFoundException("Pedido no encontrado con ID: " + request.orderId());
        }

        String series = request.series().trim();
        String number = request.number().trim();

        if (invoiceRepository.existsBySeriesAndNumber(series, number)) {
            throw new IllegalArgumentException("Ya existe un comprobante con esa serie y número");
        }

        validateAmounts(request.subtotal(), request.taxAmount(), request.totalAmount());

        Invoice invoice = Invoice.builder()
                .orderId(request.orderId())
                .invoiceType(request.invoiceType())
                .series(series)
                .number(number)
                .receiverTaxId(request.receiverTaxId().trim())
                .receiverName(request.receiverName().trim())
                .subtotal(request.subtotal())
                .taxAmount(request.taxAmount())
                .totalAmount(request.totalAmount())
                .status(InvoiceStatus.ISSUED)
                .issuedAt(request.issuedAt() != null ? request.issuedAt() : OffsetDateTime.now())
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice created: {}-{} (orderId={})", saved.getSeries(), saved.getNumber(), saved.getOrderId());
        return invoiceMapper.toResponse(saved);
    }

    @Transactional
    public InvoiceResponse updateStatus(Long id, UpdateInvoiceStatusRequest request) {
        Invoice invoice = findById(id);
        invoice.setStatus(request.status());
        Invoice updated = invoiceRepository.save(invoice);
        return invoiceMapper.toResponse(updated);
    }

    private Invoice findById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comprobante no encontrado con ID: " + id));
    }

    private void validateAmounts(BigDecimal subtotal, BigDecimal taxAmount, BigDecimal totalAmount) {
        if (subtotal == null || taxAmount == null || totalAmount == null) {
            throw new IllegalArgumentException("Subtotal/IGV/Total son requeridos");
        }
        if (subtotal.compareTo(BigDecimal.ZERO) < 0 || taxAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Subtotal e IGV deben ser mayor o igual a 0");
        }
        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total debe ser mayor a 0");
        }
        if (subtotal.add(taxAmount).compareTo(totalAmount) != 0) {
            throw new IllegalArgumentException("Total debe ser igual a Subtotal + IGV");
        }
    }
}
