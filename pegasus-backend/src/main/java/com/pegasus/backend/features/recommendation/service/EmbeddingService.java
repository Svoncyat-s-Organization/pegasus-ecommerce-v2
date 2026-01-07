package com.pegasus.backend.features.recommendation.service;

import com.pegasus.backend.features.recommendation.client.HuggingFaceClient;
import com.pegasus.backend.features.recommendation.config.EmbeddingConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for generating and caching text embeddings.
 * Embeddings are stored in-memory (ConcurrentHashMap) for simplicity.
 * No database dependency - embeddings regenerated on restart or via admin endpoint.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingService {

    private final EmbeddingConfig config;
    private final HuggingFaceClient huggingFaceClient;

    /**
     * In-memory cache for product embeddings.
     * Key: productId, Value: embedding vector (384 dimensions)
     */
    private final Map<Long, float[]> embeddingCache = new ConcurrentHashMap<>();

    /**
     * Generate embedding vector for text.
     * Returns null if embedding generation fails (graceful degradation).
     *
     * @param text Product name + description combined
     * @return float array of embedding dimensions, or null if failed/disabled
     */
    public float[] generateEmbedding(String text) {
        if (!config.isConfigured()) {
            log.debug("Embedding generation is disabled or not configured");
            return null;
        }

        if (text == null || text.isBlank()) {
            log.debug("Empty text provided, skipping embedding generation");
            return null;
        }

        String cleanText = text.trim();
        log.debug("Generating embedding for: {}...",
                cleanText.substring(0, Math.min(50, cleanText.length())));

        try {
            return huggingFaceClient.embed(cleanText);
        } catch (Exception e) {
            log.error("Embedding generation failed: {}", e.getMessage());
            return null; // Graceful degradation
        }
    }

    /**
     * Get cached embedding for a product.
     *
     * @param productId Product ID
     * @return Cached embedding or null if not cached
     */
    public float[] getCachedEmbedding(Long productId) {
        return embeddingCache.get(productId);
    }

    /**
     * Cache embedding for a product.
     *
     * @param productId Product ID
     * @param embedding Embedding vector
     */
    public void cacheEmbedding(Long productId, float[] embedding) {
        if (embedding != null) {
            embeddingCache.put(productId, embedding);
        }
    }

    /**
     * Remove embedding from cache.
     *
     * @param productId Product ID
     */
    public void removeCachedEmbedding(Long productId) {
        embeddingCache.remove(productId);
    }

    /**
     * Clear all cached embeddings.
     */
    public void clearCache() {
        embeddingCache.clear();
        log.info("Embedding cache cleared");
    }

    /**
     * Get the number of cached embeddings.
     *
     * @return Number of products with cached embeddings
     */
    public int getCacheSize() {
        return embeddingCache.size();
    }

    /**
     * Check if embedding service is enabled and configured.
     *
     * @return true if embeddings can be generated
     */
    public boolean isEnabled() {
        return config.isConfigured();
    }

    /**
     * Get the embedding dimension (for validation).
     *
     * @return expected embedding dimension (384 for all-MiniLM-L6-v2)
     */
    public int getDimension() {
        return config.getDimension();
    }

    /**
     * Get all cached embeddings (for similarity calculation).
     *
     * @return Map of productId to embedding
     */
    public Map<Long, float[]> getAllCachedEmbeddings() {
        return Map.copyOf(embeddingCache);
    }
}
