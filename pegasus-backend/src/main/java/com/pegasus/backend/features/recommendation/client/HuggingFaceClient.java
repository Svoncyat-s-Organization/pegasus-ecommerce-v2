package com.pegasus.backend.features.recommendation.client;

import com.pegasus.backend.features.recommendation.config.EmbeddingConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Client for HuggingFace Inference API.
 * Generates text embeddings using sentence-transformers models.
 */
@Component
@Slf4j
public class HuggingFaceClient {

    private final EmbeddingConfig config;
    private final RestClient restClient;

    public HuggingFaceClient(EmbeddingConfig config) {
        this.config = config;
        this.restClient = RestClient.builder()
                .baseUrl(config.getApiUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Generate embedding for the given text using HuggingFace Inference API.
     *
     * @param text The text to embed
     * @return float array of embedding values (384 dimensions for all-MiniLM-L6-v2)
     * @throws RuntimeException if API call fails
     */
    public float[] embed(String text) {
        if (text == null || text.isBlank()) {
            log.warn("Empty text provided for embedding, returning zero vector");
            return new float[config.getDimension()];
        }

        // Truncate text if too long
        String truncatedText = text.length() > config.getMaxTextLength()
                ? text.substring(0, config.getMaxTextLength())
                : text;

        log.debug("Generating embedding for text: {}...",
                truncatedText.substring(0, Math.min(50, truncatedText.length())));

        try {
            // HuggingFace expects: {"inputs": "text to embed"}
            Map<String, String> requestBody = Map.of("inputs", truncatedText);

            // Response can be either:
            // - Flat array: [0.1, 0.2, ...] (newer API format)
            // - Nested array: [[0.1, 0.2, ...]] (older format)
            @SuppressWarnings("unchecked")
            List<?> response = restClient.post()
                    .header("Authorization", "Bearer " + config.getApiKey())
                    .body(requestBody)
                    .retrieve()
                    .body(List.class);

            if (response == null || response.isEmpty()) {
                throw new RuntimeException("Empty response from HuggingFace API");
            }

            // Check if response is nested [[...]] or flat [...]
            List<Double> embedding;
            if (response.get(0) instanceof List) {
                // Nested format: [[0.1, 0.2, ...]]
                @SuppressWarnings("unchecked")
                List<Double> nested = (List<Double>) response.get(0);
                embedding = nested;
            } else {
                // Flat format: [0.1, 0.2, ...]
                @SuppressWarnings("unchecked")
                List<Double> flat = (List<Double>) response;
                embedding = flat;
            }

            float[] result = new float[embedding.size()];
            for (int i = 0; i < embedding.size(); i++) {
                result[i] = embedding.get(i).floatValue();
            }

            log.debug("Successfully generated embedding with {} dimensions", result.length);
            return result;

        } catch (Exception e) {
            log.error("Failed to generate embedding from HuggingFace: {}", e.getMessage());
            throw new RuntimeException("Embedding generation failed: " + e.getMessage(), e);
        }
    }
}
