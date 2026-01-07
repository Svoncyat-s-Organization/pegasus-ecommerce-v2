package com.pegasus.backend.features.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO representing a single product recommendation item.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationItem {

    private Long id;
    private String code;
    private String name;
    private String slug;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private BigDecimal minPrice;
    private String primaryImageUrl;
    private Double similarityScore;
    private RecommendationReason reason;

    /**
     * Reason why this product was recommended.
     */
    public enum RecommendationReason {
        /** AI-based content similarity using embeddings */
        CONTENT_SIMILARITY,
        /** Same category as the viewed product */
        SAME_CATEGORY,
        /** Same brand as the viewed product */
        SAME_BRAND,
        /** Featured product (fallback) */
        FEATURED,
        /** Random product (last resort fallback) */
        RANDOM
    }
}
