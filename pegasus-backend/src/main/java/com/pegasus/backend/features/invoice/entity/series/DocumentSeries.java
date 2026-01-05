package com.pegasus.backend.features.invoice.entity.series;

import com.pegasus.backend.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "document_series")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class DocumentSeries extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 20)
    private DocumentSeriesType documentType;

    @Column(name = "series", nullable = false, length = 4)
    private String series;

    @Column(name = "current_number", nullable = false)
    private Integer currentNumber = 0;
}
