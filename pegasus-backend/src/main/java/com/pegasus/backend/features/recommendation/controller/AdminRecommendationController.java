package com.pegasus.backend.features.recommendation.controller;

import com.pegasus.backend.features.recommendation.dto.RecommendationStatusResponse;
import com.pegasus.backend.features.recommendation.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin controller for managing product recommendations.
 * Requires ADMIN role for all endpoints.
 * Path: /api/admin/recommendations
 */
@RestController
@RequestMapping("/api/admin/recommendations")
@RequiredArgsConstructor
@Tag(name = "Admin - Recommendations", description = "Admin endpoints for managing AI recommendations")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRecommendationController {

    private final RecommendationService recommendationService;

    /**
     * POST /api/admin/recommendations/reindex
     * Regenerate all product embeddings.
     */
    @PostMapping("/reindex")
    @Operation(
            summary = "Reindex product embeddings",
            description = "Regenerates AI embeddings for all active products. This may take several minutes."
    )
    public ResponseEntity<Map<String, Object>> reindexEmbeddings() {
        Map<String, Object> result = recommendationService.reindexEmbeddings();
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/admin/recommendations/status
     * Get the status of the recommendation system.
     */
    @GetMapping("/status")
    @Operation(
            summary = "Get recommendation system status",
            description = "Returns information about the AI recommendation system including " +
                    "enabled status, number of products with embeddings, etc."
    )
    public ResponseEntity<RecommendationStatusResponse> getStatus() {
        RecommendationStatusResponse status = recommendationService.getStatus();
        return ResponseEntity.ok(status);
    }
}
