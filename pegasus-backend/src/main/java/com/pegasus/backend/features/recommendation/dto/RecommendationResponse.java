package com.pegasus.backend.features.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for product recommendations API response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    /** ID of the source product */
    private Long productId;

    /** Name of the source product */
    private String productName;

    /** List of recommended products */
    private List<RecommendationItem> recommendations;

    /** Total number of recommendations returned */
    private int totalRecommendations;

    /** Method used to generate recommendations */
    private RecommendationMethod method;

    /**
     * Method used to generate recommendations.
     */
    public enum RecommendationMethod {
        /** AI-based using vector embeddings */
        AI_EMBEDDING,
        /** Fallback to same category */
        CATEGORY_FALLBACK,
        /** Fallback to same brand */
        BRAND_FALLBACK,
        /** Fallback to featured products */
        FEATURED_FALLBACK,
        /** Mixed fallback (combination of methods) */
        MIXED_FALLBACK
    }
}
