package com.pegasus.backend.features.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for admin recommendation status endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationStatusResponse {

    /** Whether AI recommendations are enabled */
    private boolean enabled;

    /** The embedding provider being used */
    private String provider;

    /** Total number of products in the system */
    private long totalProducts;

    /** Number of products with cached embeddings */
    private int productsWithEmbeddings;

    /** Embedding vector dimension */
    private int embeddingDimension;

    /** Last time embeddings were regenerated */
    private LocalDateTime lastReindexAt;

    /** Status message */
    private String message;
}
