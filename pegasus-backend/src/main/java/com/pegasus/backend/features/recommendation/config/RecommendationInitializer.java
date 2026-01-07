package com.pegasus.backend.features.recommendation.config;

import com.pegasus.backend.features.recommendation.service.RecommendationService;
import com.pegasus.backend.features.recommendation.service.EmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Initializes the recommendation system on application startup.
 * Automatically indexes all products for AI-based recommendations.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationInitializer {

    private final RecommendationService recommendationService;
    private final EmbeddingService embeddingService;

    /**
     * Automatically reindex all products when the application is ready.
     * This ensures AI recommendations work immediately after startup.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (!embeddingService.isEnabled()) {
            log.info("AI embeddings disabled - skipping automatic reindex");
            return;
        }

        log.info("Starting automatic embedding reindex on startup...");
        
        try {
            Map<String, Object> result = recommendationService.reindexEmbeddings();
            
            int processed = (int) result.get("productsProcessed");
            int success = (int) result.get("productsWithEmbeddings");
            int errors = (int) result.get("errors");
            
            log.info("Automatic reindex completed: {} products indexed, {} errors", success, errors);
            
            if (errors > 0) {
                log.warn("Some products failed to index. Check HuggingFace API configuration.");
            }
        } catch (Exception e) {
            log.error("Failed to perform automatic reindex: {}", e.getMessage());
            log.warn("AI recommendations will use fallback mode until manual reindex is performed.");
        }
    }
}
