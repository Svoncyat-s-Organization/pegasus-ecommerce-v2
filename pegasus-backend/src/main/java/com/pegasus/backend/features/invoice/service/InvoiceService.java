package com.pegasus.backend.features.invoice.service;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.invoice.dto.CreateInvoiceRequest;
import com.pegasus.backend.features.invoice.dto.InvoiceResponse;
import com.pegasus.backend.features.invoice.dto.InvoiceSummaryResponse;
import com.pegasus.backend.features.invoice.dto.UpdateInvoiceStatusRequest;
import com.pegasus.backend.features.invoice.entity.Invoice;
import com.pegasus.backend.features.invoice.entity.InvoiceStatus;
import com.pegasus.backend.features.invoice.entity.InvoiceType;
import com.pegasus.backend.features.invoice.entity.series.DocumentSeries;
import com.pegasus.backend.features.invoice.entity.series.DocumentSeriesType;
import com.pegasus.backend.features.invoice.mapper.InvoiceMapper;
import com.pegasus.backend.features.invoice.repository.InvoiceRepository;
import com.pegasus.backend.features.order.entity.Order;
import com.pegasus.backend.features.invoice.service.series.DocumentSeriesService;
import com.pegasus.backend.features.order.repository.OrderRepository;
import com.pegasus.backend.shared.dto.PageResponse;
import com.pegasus.backend.shared.enums.OrderStatus;
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
    private final DocumentSeriesService documentSeriesService;

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

    public List<Long> getInvoicedOrderIds(List<Long> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return List.of();
        }
        return invoiceRepository.findInvoicedOrderIds(orderIds);
    }

    @Transactional
    public InvoiceResponse create(CreateInvoiceRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + request.orderId()));

        if (invoiceRepository.existsByOrderId(request.orderId())) {
            throw new BadRequestException("Ya existe un comprobante para el pedido seleccionado");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException("Solo se puede emitir un comprobante si el pedido está pagado");
        }

        SeriesNumber seriesNumber = resolveSeriesAndNumber(request);
        String series = seriesNumber.series;
        String number = seriesNumber.number;

        validateAmounts(request.subtotal(), request.taxAmount(), request.totalAmount());

        Invoice invoice = Invoice.builder()
                .orderId(request.orderId())
                .seriesId(request.seriesId())
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

    private SeriesNumber resolveSeriesAndNumber(CreateInvoiceRequest request) {
        Long seriesId = request.seriesId();

        if (seriesId != null) {
            DocumentSeriesType expectedType = mapSeriesType(request.invoiceType());

            for (int attempts = 0; attempts < 20; attempts++) {
                DocumentSeries reserved = documentSeriesService.reserveNextNumber(seriesId, expectedType);
                String series = reserved.getSeries().trim();
                String number = formatInvoiceNumber(reserved.getCurrentNumber());

                if (!invoiceRepository.existsBySeriesAndNumber(series, number)) {
                    return new SeriesNumber(series, number);
                }
            }

            throw new BadRequestException("No se pudo generar un correlativo disponible para la serie");
        }

        if (request.series() == null || request.series().isBlank()) {
            throw new BadRequestException("La serie es requerida");
        }
        if (request.number() == null || request.number().isBlank()) {
            throw new BadRequestException("El número es requerido");
        }

        String series = request.series().trim();
        String number = request.number().trim();

        if (invoiceRepository.existsBySeriesAndNumber(series, number)) {
            throw new BadRequestException("Ya existe un comprobante con esa serie y número");
        }

        return new SeriesNumber(series, number);
    }

    private DocumentSeriesType mapSeriesType(InvoiceType invoiceType) {
        return switch (invoiceType) {
            case BILL -> DocumentSeriesType.BILL;
            case INVOICE -> DocumentSeriesType.INVOICE;
        };
    }

    private String formatInvoiceNumber(Integer next) {
        int value = next != null ? next : 0;
        return String.format("%08d", value);
    }

    private record SeriesNumber(String series, String number) {
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
