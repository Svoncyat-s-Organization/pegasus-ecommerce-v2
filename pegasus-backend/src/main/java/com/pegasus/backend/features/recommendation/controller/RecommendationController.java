package com.pegasus.backend.features.recommendation.controller;

import com.pegasus.backend.features.recommendation.dto.RecommendationResponse;
import com.pegasus.backend.features.recommendation.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public controller for product recommendations.
 * Provides AI-powered similar product suggestions.
 * Path: /api/recommendations
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "AI-powered product recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * GET /api/recommendations/similar/{productId}
     * Get similar products for a given product.
     *
     * @param productId The product ID to find recommendations for
     * @param limit Maximum number of recommendations (default: 6, max: 12)
     * @return List of similar products
     */
    @GetMapping("/similar/{productId}")
    @Operation(
            summary = "Get similar products",
            description = "Returns products similar to the given product using AI-based content similarity. " +
                    "Falls back to category/brand based recommendations if AI is unavailable."
    )
    public ResponseEntity<RecommendationResponse> getSimilarProducts(
            @Parameter(description = "Product ID to find recommendations for")
            @PathVariable Long productId,
            @Parameter(description = "Maximum number of recommendations (default: 6, max: 12)")
            @RequestParam(defaultValue = "6") int limit
    ) {
        RecommendationResponse response = recommendationService.getSimilarProducts(productId, limit);
        return ResponseEntity.ok(response);
    }
}
