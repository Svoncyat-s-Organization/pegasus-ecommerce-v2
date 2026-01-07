---
applyTo: "pegasus-backend/**/ai/**/*.java, pegasus-backend/**/recommendation/**/*.java, pegasus-frontend/**/recommendation/**/*.ts, pegasus-frontend/**/recommendation/**/*.tsx"
---

# AI Context: Product Recommendations System

## Overview

This project implements **AI-powered product recommendations** for the Pegasus E-commerce platform.
The AI suggests "Similar Products" and "You might also like" based on product content similarity.

**Why Recommendations over Chatbot/Search:**
- Academic requirement: Must integrate AI but NOT as chatbot
- Highly visible feature (shown on every product page)
- Easy to demonstrate with screenshots for documentation
- Provides clear business value for e-commerce

---

## CRITICAL: Implementation Status

**Current State:** Product recommendations using content-based filtering with HuggingFace embeddings.

**What's Implemented:**
- `/api/recommendations/similar/{productId}` - Get similar products
- `RecommendationService` - Core recommendation logic
- `EmbeddingService` - Generate text embeddings via HuggingFace API
- Frontend component showing "Productos similares" on product detail page

**Fallback Behavior:**
If AI is disabled or fails, recommendations fall back to:
1. Products in the same category
2. Products from the same brand
3. Featured products

---

## 1. Architecture

**Technology Stack:**
- HuggingFace Inference API (all-MiniLM-L6-v2 model)
- PostgreSQL for product storage
- Spring Boot backend
- React frontend with Mantine UI

**Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│  User views Product A (iPhone 15 Pro)                          │
│       │                                                         │
│       ▼                                                         │
│  Frontend calls: GET /api/recommendations/similar/1             │
│       │                                                         │
│       ▼                                                         │
│  RecommendationService.getSimilarProducts(productId)           │
│       │                                                         │
│       ▼                                                         │
│  IF embeddings exist:                                          │
│    → Calculate cosine similarity with all products             │
│    → Return top N most similar                                 │
│  ELSE (fallback):                                              │
│    → Return products from same category/brand                  │
│       │                                                         │
│       ▼                                                         │
│  Response: [Samsung Galaxy, AirPods Pro, iPhone Case...]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Structure

**Package:** `com.pegasus.backend.features.recommendation/`

```
recommendation/
├── controller/
│   └── RecommendationController.java      # Public API endpoints
├── service/
│   ├── RecommendationService.java         # Core recommendation logic
│   └── EmbeddingService.java              # HuggingFace API integration
├── dto/
│   └── RecommendationResponse.java        # API response DTO
└── config/
    └── EmbeddingConfig.java               # Configuration properties
```

---

## 3. API Endpoints

### Get Similar Products
```
GET /api/recommendations/similar/{productId}?limit={limit}

Parameters:
- productId: ID of the product to find recommendations for
- limit: Maximum number of recommendations (default: 6, max: 12)

Response:
{
  "productId": 1,
  "productName": "iPhone 15 Pro",
  "recommendations": [
    {
      "id": 2,
      "code": "PROD-002",
      "name": "Samsung Galaxy S24 Ultra",
      "slug": "galaxy-s24-ultra",
      "description": "Galaxy S24 Ultra con Galaxy AI...",
      "categoryId": 4,
      "categoryName": "Smartphones",
      "brandId": 2,
      "brandName": "Samsung",
      "minPrice": 4999.00,
      "primaryImageUrl": "/images/galaxy-s24.jpg",
      "similarityScore": 0.87,
      "reason": "CONTENT_SIMILARITY"
    }
  ],
  "totalRecommendations": 6,
  "method": "AI_EMBEDDING"  // or "CATEGORY_FALLBACK", "BRAND_FALLBACK"
}
```

### Admin: Regenerate Embeddings
```
POST /api/admin/recommendations/reindex
Authorization: Bearer {token}

Response:
{
  "message": "Reindexing started",
  "productsProcessed": 50,
  "productsWithEmbeddings": 48,
  "errors": 2
}
```

### Admin: Get Recommendation Status
```
GET /api/admin/recommendations/status
Authorization: Bearer {token}

Response:
{
  "enabled": true,
  "provider": "huggingface",
  "totalProducts": 50,
  "productsWithEmbeddings": 48,
  "embeddingDimension": 384,
  "lastReindexAt": "2026-01-07T10:30:00Z"
}
```

---

## 4. Configuration

**Environment Variables (.env):**
```properties
# AI Recommendations Configuration
AI_EMBEDDING_ENABLED=true
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx

# Optional: Use OpenAI instead
# AI_EMBEDDING_PROVIDER=openai
# OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

**application.properties:**
```properties
# AI Embedding Configuration
ai.embedding.enabled=${AI_EMBEDDING_ENABLED:false}
ai.embedding.provider=${AI_EMBEDDING_PROVIDER:huggingface}
ai.embedding.huggingface.api-url=https://router.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2
ai.embedding.huggingface.api-key=${HUGGINGFACE_API_KEY:}
ai.embedding.dimension=384
ai.embedding.max-text-length=512
```

---

## 5. Frontend Integration

**Location:** `features/storefront/catalog/components/`

**ProductRecommendations.tsx:**
- Displayed on ProductDetail page
- Shows grid of 4-6 recommended products
- Each card links to the recommended product
- Loading skeleton while fetching
- Graceful handling if no recommendations

**Usage in ProductDetail:**
```tsx
<ProductRecommendations 
  productId={product.id} 
  limit={6} 
/>
```

---

## 6. Fallback Strategy (CRITICAL)

**Rule:** AI failure MUST NOT break the application.

**Fallback Order:**
1. **AI Embeddings:** If available and working, use cosine similarity
2. **Same Category:** Products in the same category as the viewed product
3. **Same Brand:** Products from the same brand
4. **Featured Products:** General featured products as last resort

```java
public List<RecommendationItem> getRecommendations(Long productId, int limit) {
    // Try AI-based recommendations first
    if (embeddingService.isEnabled()) {
        try {
            List<RecommendationItem> aiResults = getAIRecommendations(productId, limit);
            if (!aiResults.isEmpty()) {
                return aiResults;
            }
        } catch (Exception e) {
            log.warn("AI recommendations failed: {}", e.getMessage());
        }
    }
    
    // Fallback chain
    return getFallbackRecommendations(productId, limit);
}
```

---

## 7. Implementation Rules

### DO:
- Always provide fallback when AI is unavailable
- Log AI failures but don't expose errors to users
- Cache embeddings in database to reduce API calls
- Limit API calls with rate limiting
- Show loading states in frontend

### DON'T:
- Don't block page load waiting for recommendations
- Don't fail silently without fallback
- Don't store API keys in code
- Don't call embedding API on every request (cache results)
- Don't show error messages to end users

---

## 8. Testing & Demonstration

**For Academic Documentation:**

1. **Screenshot 1:** Product detail page showing "Productos similares" section
2. **Screenshot 2:** API response in Swagger/Postman showing similarity scores
3. **Screenshot 3:** Admin panel showing recommendation status
4. **Screenshot 4:** Comparison - AI recommendations vs category fallback

**Test Scenarios:**
- View iPhone → Should recommend other smartphones, accessories
- View laptop → Should recommend monitors, keyboards, mice
- Disable AI → Should fallback to category-based recommendations

---

## 9. Files Changed/Created

**Backend (new):**
- `features/recommendation/controller/RecommendationController.java`
- `features/recommendation/service/RecommendationService.java`
- `features/recommendation/service/EmbeddingService.java`
- `features/recommendation/dto/RecommendationResponse.java`
- `features/recommendation/config/EmbeddingConfig.java`

**Backend (modified):**
- `application.properties` - AI config properties
- `SecurityConfig.java` - Public endpoint for recommendations

**Frontend (new):**
- `features/storefront/catalog/components/ProductRecommendations.tsx`
- `features/storefront/catalog/api/recommendationApi.ts`
- `features/storefront/catalog/hooks/useRecommendations.ts`

**Frontend (modified):**
- `features/storefront/catalog/pages/ProductDetail.tsx` - Add recommendations component

---

## 10. Embedding Storage Strategy

**Embeddings are stored in-memory** (not in database) for simplicity:
- Generated on application startup or first request
- Cached in a ConcurrentHashMap
- No pgvector dependency required
- Reindex endpoint refreshes the cache

```java
@Service
public class EmbeddingService {
    private final Map<Long, float[]> embeddingCache = new ConcurrentHashMap<>();
    
    public float[] getEmbedding(Long productId) {
        return embeddingCache.get(productId);
    }
    
    public void cacheEmbedding(Long productId, float[] embedding) {
        embeddingCache.put(productId, embedding);
    }
}
```

---

## 11. Similarity Calculation

**Cosine Similarity** between two vectors:

```java
public double cosineSimilarity(float[] a, float[] b) {
    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;
    
    for (int i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

---

## 12. Cost & Limits

| Provider | Cost | Rate Limit | Recommendation |
|----------|------|------------|----------------|
| HuggingFace (free) | $0 | ~30k requests/month | Good for MVP/Academic |
| OpenAI text-embedding-3-small | $0.02/1M tokens | High | Production |

**For academic project:** HuggingFace free tier is sufficient.

---

## 13. Quick Start Checklist

- [ ] Obtain HuggingFace API key (free: https://huggingface.co/settings/tokens)
- [ ] Set `AI_EMBEDDING_ENABLED=true` in .env
- [ ] Set `HUGGINGFACE_API_KEY=hf_xxx` in .env
- [ ] Restart backend
- [ ] Call `POST /api/admin/recommendations/reindex` to generate embeddings
- [ ] View any product page to see recommendations
