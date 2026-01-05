package com.pegasus.backend.features.invoice.repository.series;

import com.pegasus.backend.features.invoice.entity.series.DocumentSeries;
import com.pegasus.backend.features.invoice.entity.series.DocumentSeriesType;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DocumentSeriesRepository extends JpaRepository<DocumentSeries, Long> {

    boolean existsByDocumentTypeAndSeries(DocumentSeriesType documentType, String series);

    @Query("SELECT ds FROM DocumentSeries ds WHERE " +
            "LOWER(ds.series) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(CAST(ds.documentType AS string)) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<DocumentSeries> search(@Param("search") String search, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ds FROM DocumentSeries ds WHERE ds.id = :id")
    Optional<DocumentSeries> findByIdForUpdate(@Param("id") Long id);
}
