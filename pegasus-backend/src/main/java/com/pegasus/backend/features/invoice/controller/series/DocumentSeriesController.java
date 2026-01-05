package com.pegasus.backend.features.invoice.controller.series;

import com.pegasus.backend.features.invoice.dto.series.CreateDocumentSeriesRequest;
import com.pegasus.backend.features.invoice.dto.series.DocumentSeriesResponse;
import com.pegasus.backend.features.invoice.dto.series.UpdateDocumentSeriesRequest;
import com.pegasus.backend.features.invoice.service.series.DocumentSeriesService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/billing/document-series")
@RequiredArgsConstructor
@Tag(name = "Billing - Document Series", description = "Configuración de series y correlativos")
@PreAuthorize("hasRole('ADMIN')")
public class DocumentSeriesController {

    private final DocumentSeriesService documentSeriesService;

    @GetMapping
    @Operation(summary = "Listar series", description = "Obtener series con paginación y búsqueda opcional")
    @ApiResponse(responseCode = "200", description = "Lista obtenida exitosamente")
    public ResponseEntity<PageResponse<DocumentSeriesResponse>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(documentSeriesService.getAll(search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener serie", description = "Obtener una serie por ID")
    public ResponseEntity<DocumentSeriesResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(documentSeriesService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Crear serie", description = "Crear una nueva serie con correlativo inicial")
    public ResponseEntity<DocumentSeriesResponse> create(@Valid @RequestBody CreateDocumentSeriesRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentSeriesService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar serie", description = "Actualizar serie y/o correlativo")
    public ResponseEntity<DocumentSeriesResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDocumentSeriesRequest request) {
        return ResponseEntity.ok(documentSeriesService.update(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Activar/Desactivar", description = "Alternar estado activo/inactivo")
    public ResponseEntity<DocumentSeriesResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(documentSeriesService.toggleStatus(id));
    }
}
