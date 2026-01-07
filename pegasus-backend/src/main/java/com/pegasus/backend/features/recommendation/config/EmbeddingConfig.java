package com.pegasus.backend.features.recommendation.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for AI embedding service.
 * Loaded from application.properties with prefix "ai.embedding"
 */
@Configuration
@ConfigurationProperties(prefix = "ai.embedding")
@Data
public class EmbeddingConfig {

    /**
     * Whether AI embedding generation is enabled.
     * If false, recommendations fall back to category/brand based.
     */
    private boolean enabled = false;

    /**
     * The embedding provider to use (huggingface, openai)
     */
    private String provider = "huggingface";

    /**
     * API URL for the embedding service.
     * For HuggingFace: https://router.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2
     */
    private String apiUrl = "https://router.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

    /**
     * API key for the embedding service.
     * For HuggingFace: starts with "hf_"
     */
    private String apiKey;

    /**
     * Dimension of the embedding vectors.
     * Must match the model used (all-MiniLM-L6-v2 = 384)
     */
    private int dimension = 384;

    /**
     * Maximum text length to send for embedding generation.
     * Longer texts will be truncated.
     */
    private int maxTextLength = 512;

    /**
     * Check if the service is properly configured.
     */
    public boolean isConfigured() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }
}
