package com.pegasus.backend.features.recommendation.service;

import com.pegasus.backend.features.catalog.entity.Product;
import com.pegasus.backend.features.catalog.entity.Variant;
import com.pegasus.backend.features.catalog.entity.Image;
import com.pegasus.backend.features.catalog.repository.ProductRepository;
import com.pegasus.backend.features.catalog.repository.VariantRepository;
import com.pegasus.backend.features.catalog.repository.ImageRepository;
import com.pegasus.backend.features.recommendation.dto.RecommendationItem;
import com.pegasus.backend.features.recommendation.dto.RecommendationResponse;
import com.pegasus.backend.features.recommendation.dto.RecommendationStatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating product recommendations.
 * Uses AI embeddings for content-based similarity with fallback to category/brand.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final ProductRepository productRepository;
    private final VariantRepository variantRepository;
    private final ImageRepository imageRepository;
    private final EmbeddingService embeddingService;

    private static final int MAX_RECOMMENDATIONS = 12;
    private static final int DEFAULT_RECOMMENDATIONS = 6;

    private LocalDateTime lastReindexAt = null;

    /**
     * Get similar products for a given product.
     *
     * @param productId The product to find recommendations for
     * @param limit Maximum number of recommendations (default: 6, max: 12)
     * @return RecommendationResponse with list of similar products
     */
    public RecommendationResponse getSimilarProducts(Long productId, int limit) {
        int effectiveLimit = Math.min(Math.max(limit, 1), MAX_RECOMMENDATIONS);

        Product sourceProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        List<RecommendationItem> recommendations;
        RecommendationResponse.RecommendationMethod method;

        // Try AI-based recommendations first
        if (embeddingService.isEnabled() && embeddingService.getCacheSize() > 0) {
            try {
                recommendations = getAIRecommendations(sourceProduct, effectiveLimit);
                if (!recommendations.isEmpty()) {
                    method = RecommendationResponse.RecommendationMethod.AI_EMBEDDING;
                    log.info("AI recommendations for product {}: {} results", productId, recommendations.size());
                    return buildResponse(sourceProduct, recommendations, method);
                }
            } catch (Exception e) {
                log.warn("AI recommendations failed for product {}: {}", productId, e.getMessage());
            }
        }

        // Fallback chain
        recommendations = getFallbackRecommendations(sourceProduct, effectiveLimit);
        method = determineMethodFromRecommendations(recommendations);

        log.info("Fallback recommendations for product {}: {} results using {}", 
                productId, recommendations.size(), method);

        return buildResponse(sourceProduct, recommendations, method);
    }

    /**
     * Get AI-based recommendations using cosine similarity of embeddings.
     * Filters by same category first to ensure relevant recommendations.
     */
    private List<RecommendationItem> getAIRecommendations(Product sourceProduct, int limit) {
        float[] sourceEmbedding = embeddingService.getCachedEmbedding(sourceProduct.getId());

        if (sourceEmbedding == null) {
            // Generate embedding on-the-fly if not cached
            String text = buildEmbeddingText(sourceProduct);
            sourceEmbedding = embeddingService.generateEmbedding(text);
            if (sourceEmbedding != null) {
                embeddingService.cacheEmbedding(sourceProduct.getId(), sourceEmbedding);
            } else {
                return Collections.emptyList();
            }
        }

        // Get products from SAME CATEGORY only for relevant recommendations
        List<Product> sameCategoryProducts = sourceProduct.getCategoryId() != null
                ? productRepository.findActiveByCategoryId(sourceProduct.getCategoryId(), PageRequest.of(0, 50)).getContent()
                : Collections.emptyList();

        // Calculate similarity only with products in same category
        Map<Long, float[]> allEmbeddings = embeddingService.getAllCachedEmbeddings();
        List<Map.Entry<Long, Double>> similarities = new ArrayList<>();

        Set<Long> sameCategoryIds = sameCategoryProducts.stream()
                .map(Product::getId)
                .collect(Collectors.toSet());

        for (Map.Entry<Long, float[]> entry : allEmbeddings.entrySet()) {
            Long productId = entry.getKey();
            
            // Skip source product and products NOT in same category
            if (productId.equals(sourceProduct.getId()) || !sameCategoryIds.contains(productId)) {
                continue;
            }

            double similarity = cosineSimilarity(sourceEmbedding, entry.getValue());
            similarities.add(Map.entry(productId, similarity));
        }

        // Sort by similarity (highest first) and take top N
        similarities.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        List<Long> topProductIds = similarities.stream()
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Fetch products and build response
        return topProductIds.stream()
                .map(productId -> {
                    Product product = productRepository.findById(productId).orElse(null);
                    if (product == null || !product.getIsActive()) {
                        return null;
                    }
                    double score = similarities.stream()
                            .filter(e -> e.getKey().equals(productId))
                            .findFirst()
                            .map(Map.Entry::getValue)
                            .orElse(0.0);
                    return buildRecommendationItem(product, score, RecommendationItem.RecommendationReason.CONTENT_SIMILARITY);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Get fallback recommendations based on category, brand, or featured products.
     */
    private List<RecommendationItem> getFallbackRecommendations(Product sourceProduct, int limit) {
        List<RecommendationItem> recommendations = new ArrayList<>();
        Set<Long> addedProductIds = new HashSet<>();
        addedProductIds.add(sourceProduct.getId()); // Exclude source product

        // Step 1: Products from same category
        if (sourceProduct.getCategoryId() != null && recommendations.size() < limit) {
            List<Product> categoryProducts = productRepository.findActiveByCategoryId(
                    sourceProduct.getCategoryId(), 
                    PageRequest.of(0, limit * 2)
            ).getContent();

            for (Product p : categoryProducts) {
                if (!addedProductIds.contains(p.getId()) && recommendations.size() < limit) {
                    recommendations.add(buildRecommendationItem(p, null, 
                            RecommendationItem.RecommendationReason.SAME_CATEGORY));
                    addedProductIds.add(p.getId());
                }
            }
        }

        // Step 2: Products from same brand (if still need more)
        if (sourceProduct.getBrandId() != null && recommendations.size() < limit) {
            List<Product> brandProducts = productRepository.findActiveByBrandId(
                    sourceProduct.getBrandId(), 
                    PageRequest.of(0, limit * 2)
            ).getContent();

            for (Product p : brandProducts) {
                if (!addedProductIds.contains(p.getId()) && recommendations.size() < limit) {
                    recommendations.add(buildRecommendationItem(p, null, 
                            RecommendationItem.RecommendationReason.SAME_BRAND));
                    addedProductIds.add(p.getId());
                }
            }
        }

        // Step 3: Featured products (if still need more)
        if (recommendations.size() < limit) {
            List<Product> featuredProducts = productRepository.findByIsFeaturedTrue(
                    PageRequest.of(0, limit * 2)
            ).getContent();

            for (Product p : featuredProducts) {
                if (!addedProductIds.contains(p.getId()) && recommendations.size() < limit) {
                    recommendations.add(buildRecommendationItem(p, null, 
                            RecommendationItem.RecommendationReason.FEATURED));
                    addedProductIds.add(p.getId());
                }
            }
        }

        return recommendations;
    }

    /**
     * Reindex all product embeddings.
     * Called via admin endpoint to regenerate embeddings.
     *
     * @return Map with statistics about the reindexing
     */
    @Transactional(readOnly = true)
    public Map<String, Object> reindexEmbeddings() {
        if (!embeddingService.isEnabled()) {
            return Map.of(
                    "message", "AI embeddings are disabled",
                    "productsProcessed", 0,
                    "productsWithEmbeddings", 0,
                    "errors", 0
            );
        }

        log.info("Starting embedding reindex...");
        embeddingService.clearCache();

        List<Product> allProducts = productRepository.findAllActiveProducts();
        int processed = 0;
        int success = 0;
        int errors = 0;

        for (Product product : allProducts) {
            processed++;
            try {
                String text = buildEmbeddingText(product);
                float[] embedding = embeddingService.generateEmbedding(text);
                if (embedding != null) {
                    embeddingService.cacheEmbedding(product.getId(), embedding);
                    success++;
                } else {
                    errors++;
                }
            } catch (Exception e) {
                log.error("Failed to generate embedding for product {}: {}", product.getId(), e.getMessage());
                errors++;
            }

            // Log progress every 10 products
            if (processed % 10 == 0) {
                log.info("Reindex progress: {}/{} products", processed, allProducts.size());
            }
        }

        lastReindexAt = LocalDateTime.now();
        log.info("Embedding reindex completed: {} processed, {} success, {} errors", processed, success, errors);

        return Map.of(
                "message", "Reindexing completed",
                "productsProcessed", processed,
                "productsWithEmbeddings", success,
                "errors", errors
        );
    }

    /**
     * Get the status of the recommendation system.
     */
    public RecommendationStatusResponse getStatus() {
        long totalProducts = productRepository.count();

        return RecommendationStatusResponse.builder()
                .enabled(embeddingService.isEnabled())
                .provider("huggingface")
                .totalProducts(totalProducts)
                .productsWithEmbeddings(embeddingService.getCacheSize())
                .embeddingDimension(embeddingService.getDimension())
                .lastReindexAt(lastReindexAt)
                .message(embeddingService.isEnabled() 
                        ? "AI recommendations are active" 
                        : "AI disabled - using fallback recommendations")
                .build();
    }

    /**
     * Build text for embedding generation from product.
     */
    private String buildEmbeddingText(Product product) {
        StringBuilder text = new StringBuilder();
        text.append(product.getName());

        if (product.getDescription() != null && !product.getDescription().isBlank()) {
            text.append(" ").append(product.getDescription());
        }

        // Add category name if available
        if (product.getCategory() != null) {
            text.append(" ").append(product.getCategory().getName());
        }

        // Add brand name if available
        if (product.getBrand() != null) {
            text.append(" ").append(product.getBrand().getName());
        }

        return text.toString().trim();
    }

    /**
     * Build a RecommendationItem from a Product.
     */
    private RecommendationItem buildRecommendationItem(Product product, Double score, 
            RecommendationItem.RecommendationReason reason) {
        // Get minimum price from variants
        BigDecimal minPrice = getMinPrice(product.getId());

        // Get primary image URL
        String imageUrl = getPrimaryImageUrl(product.getId());

        // Get category and brand names
        String categoryName = product.getCategory() != null ? product.getCategory().getName() : null;
        String brandName = product.getBrand() != null ? product.getBrand().getName() : null;

        return RecommendationItem.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .slug(product.getSlug())
                .description(truncateDescription(product.getDescription(), 150))
                .categoryId(product.getCategoryId())
                .categoryName(categoryName)
                .brandId(product.getBrandId())
                .brandName(brandName)
                .minPrice(minPrice)
                .primaryImageUrl(imageUrl)
                .similarityScore(score)
                .reason(reason)
                .build();
    }

    /**
     * Get minimum price for a product from its variants.
     */
    private BigDecimal getMinPrice(Long productId) {
        List<Variant> variants = variantRepository.findActiveByProductId(productId);
        return variants.stream()
                .map(Variant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    /**
     * Get primary image URL for a product.
     */
    private String getPrimaryImageUrl(Long productId) {
        return imageRepository.findByProductIdAndIsPrimaryTrue(productId)
                .map(Image::getImageUrl)
                .orElseGet(() -> {
                    List<Image> images = imageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
                    return images.isEmpty() ? null : images.get(0).getImageUrl();
                });
    }

    /**
     * Build the response DTO.
     */
    private RecommendationResponse buildResponse(Product sourceProduct, 
            List<RecommendationItem> recommendations, 
            RecommendationResponse.RecommendationMethod method) {
        return RecommendationResponse.builder()
                .productId(sourceProduct.getId())
                .productName(sourceProduct.getName())
                .recommendations(recommendations)
                .totalRecommendations(recommendations.size())
                .method(method)
                .build();
    }

    /**
     * Determine the method from the recommendations list.
     */
    private RecommendationResponse.RecommendationMethod determineMethodFromRecommendations(
            List<RecommendationItem> recommendations) {
        if (recommendations.isEmpty()) {
            return RecommendationResponse.RecommendationMethod.FEATURED_FALLBACK;
        }

        Set<RecommendationItem.RecommendationReason> reasons = recommendations.stream()
                .map(RecommendationItem::getReason)
                .collect(Collectors.toSet());

        if (reasons.size() > 1) {
            return RecommendationResponse.RecommendationMethod.MIXED_FALLBACK;
        }

        RecommendationItem.RecommendationReason reason = recommendations.get(0).getReason();
        return switch (reason) {
            case CONTENT_SIMILARITY -> RecommendationResponse.RecommendationMethod.AI_EMBEDDING;
            case SAME_CATEGORY -> RecommendationResponse.RecommendationMethod.CATEGORY_FALLBACK;
            case SAME_BRAND -> RecommendationResponse.RecommendationMethod.BRAND_FALLBACK;
            case FEATURED, RANDOM -> RecommendationResponse.RecommendationMethod.FEATURED_FALLBACK;
        };
    }

    /**
     * Truncate description to a maximum length.
     */
    private String truncateDescription(String description, int maxLength) {
        if (description == null || description.length() <= maxLength) {
            return description;
        }
        return description.substring(0, maxLength - 3) + "...";
    }

    /**
     * Calculate cosine similarity between two vectors.
     *
     * @param a First vector
     * @param b Second vector
     * @return Cosine similarity value between -1 and 1 (1 = identical)
     */
    private double cosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length) {
            throw new IllegalArgumentException("Vectors must have the same dimension");
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        double denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator == 0 ? 0 : dotProduct / denominator;
    }
}
