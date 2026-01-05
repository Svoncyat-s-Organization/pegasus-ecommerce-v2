package com.pegasus.backend.features.invoice.service.series;

import com.pegasus.backend.exception.BadRequestException;
import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.invoice.dto.series.CreateDocumentSeriesRequest;
import com.pegasus.backend.features.invoice.dto.series.DocumentSeriesResponse;
import com.pegasus.backend.features.invoice.dto.series.UpdateDocumentSeriesRequest;
import com.pegasus.backend.features.invoice.entity.series.DocumentSeries;
import com.pegasus.backend.features.invoice.entity.series.DocumentSeriesType;
import com.pegasus.backend.features.invoice.mapper.series.DocumentSeriesMapper;
import com.pegasus.backend.features.invoice.repository.series.DocumentSeriesRepository;
import com.pegasus.backend.shared.dto.PageResponse;
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
public class DocumentSeriesService {

    private static final int MAX_NUMBER = 99_999_999;

    private final DocumentSeriesRepository documentSeriesRepository;
    private final DocumentSeriesMapper documentSeriesMapper;

    public PageResponse<DocumentSeriesResponse> getAll(String search, Pageable pageable) {
        Page<DocumentSeries> page = (search != null && !search.isBlank())
                ? documentSeriesRepository.search(search.trim(), pageable)
                : documentSeriesRepository.findAll(pageable);

        List<DocumentSeriesResponse> content = page.getContent().stream()
                .map(documentSeriesMapper::toResponse)
                .toList();

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    public DocumentSeriesResponse getById(Long id) {
        return documentSeriesMapper.toResponse(findById(id));
    }

    public DocumentSeries findById(Long id) {
        return documentSeriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Serie no encontrada con ID: " + id));
    }

    @Transactional
    public DocumentSeriesResponse create(CreateDocumentSeriesRequest request) {
        String series = request.series().trim();
        DocumentSeriesType type = request.documentType();

        if (documentSeriesRepository.existsByDocumentTypeAndSeries(type, series)) {
            throw new BadRequestException("Ya existe una serie para ese tipo de documento");
        }

        int current = request.currentNumber() != null ? request.currentNumber() : 0;
        if (current < 0 || current > MAX_NUMBER) {
            throw new BadRequestException("El correlativo debe estar entre 0 y " + MAX_NUMBER);
        }

        DocumentSeries entity = new DocumentSeries();
        entity.setDocumentType(type);
        entity.setSeries(series);
        entity.setCurrentNumber(current);

        DocumentSeries saved = documentSeriesRepository.save(entity);
        log.info("DocumentSeries created: {} {} (id={})", saved.getDocumentType(), saved.getSeries(), saved.getId());
        return documentSeriesMapper.toResponse(saved);
    }

    @Transactional
    public DocumentSeriesResponse update(Long id, UpdateDocumentSeriesRequest request) {
        DocumentSeries entity = findById(id);

        String series = request.series().trim();
        if (!entity.getSeries().equals(series)
                && documentSeriesRepository.existsByDocumentTypeAndSeries(entity.getDocumentType(), series)) {
            throw new BadRequestException("Ya existe una serie para ese tipo de documento");
        }

        Integer currentNumber = request.currentNumber();
        if (currentNumber != null && (currentNumber < 0 || currentNumber > MAX_NUMBER)) {
            throw new BadRequestException("El correlativo debe estar entre 0 y " + MAX_NUMBER);
        }

        entity.setSeries(series);
        if (currentNumber != null) {
            entity.setCurrentNumber(currentNumber);
        }

        DocumentSeries saved = documentSeriesRepository.save(entity);
        return documentSeriesMapper.toResponse(saved);
    }

    @Transactional
    public DocumentSeriesResponse toggleStatus(Long id) {
        DocumentSeries entity = findById(id);
        entity.setIsActive(!Boolean.TRUE.equals(entity.getIsActive()));
        return documentSeriesMapper.toResponse(documentSeriesRepository.save(entity));
    }

    /**
     * Atomically increments and returns the next number, locking the row.
     */
    @Transactional
    public int nextNumber(Long seriesId) {
        return reserveNextNumber(seriesId, null).getCurrentNumber();
    }

    /**
     * Locks the series row, validates it (active/max/type), increments the number,
     * and returns the updated entity.
     */
    @Transactional
    public DocumentSeries reserveNextNumber(Long seriesId, DocumentSeriesType expectedType) {
        DocumentSeries series = documentSeriesRepository.findByIdForUpdate(seriesId)
                .orElseThrow(() -> new ResourceNotFoundException("Serie no encontrada con ID: " + seriesId));

        if (expectedType != null && series.getDocumentType() != expectedType) {
            throw new BadRequestException("La serie no corresponde al tipo de documento solicitado");
        }

        if (!Boolean.TRUE.equals(series.getIsActive())) {
            throw new BadRequestException("La serie está inactiva");
        }

        int current = series.getCurrentNumber() != null ? series.getCurrentNumber() : 0;
        if (current >= MAX_NUMBER) {
            throw new BadRequestException("La serie alcanzó el máximo correlativo permitido");
        }

        int next = current + 1;
        series.setCurrentNumber(next);
        documentSeriesRepository.save(series);
        return series;
    }
}
