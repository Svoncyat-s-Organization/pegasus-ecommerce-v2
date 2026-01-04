---
applyTo: "pegasus-backend/**/ai/**/*.java, pegasus-backend/**/search/**/*.java, pegasus-frontend/**/search/**/*.ts, pegasus-frontend/**/search/**/*.tsx"
---

# AI Context: Semantic Search with pgvector

## CRITICAL: Implementation Timing

**DO NOT implement AI features until:**
1. Storefront is fully functional (catalog browsing, cart, checkout, orders work end-to-end)
2. Core modules are complete: Catalog, Orders, Inventory, Customers, Auth

**AI is an enhancement layer, NOT a core feature.** The e-commerce MUST work without AI.

**Implementation Order:**
```
Phase 1: Core MVP (NO AI)
├── Backend: Auth, Catalog, Orders, Inventory, Customers
├── Frontend Storefront: Browse, Cart, Checkout, Orders
├── Frontend Backoffice: Basic CRUD for all modules
└── MILESTONE: User can complete a purchase end-to-end

Phase 2: AI Enhancement (AFTER Phase 1)
├── Enable pgvector extension
├── Add embedding column to products
├── Implement embedding service
├── Add semantic search endpoint
└── Integrate in Storefront search bar
```

**Rule:** If asked to implement AI before Phase 1 is complete, REFUSE and explain the dependency.

---

## 1. Architecture Overview

**Technology Stack:**
- PostgreSQL + pgvector extension
- Embedding API: HuggingFace Inference (free tier) or OpenAI Embeddings
- Vector dimension: 384 (all-MiniLM-L6-v2 model)

**Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│                        INDEXING (Write)                         │
├─────────────────────────────────────────────────────────────────┤
│  ProductService.save()                                          │
│       │                                                         │
│       ▼                                                         │
│  EmbeddingService.generateEmbedding(product.name + description) │
│       │                                                         │
│       ▼                                                         │
│  HuggingFace API → returns float[384]                          │
│       │                                                         │
│       ▼                                                         │
│  product.setEmbedding(vector) → save to PostgreSQL             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        SEARCH (Read)                            │
├─────────────────────────────────────────────────────────────────┤
│  User types: "algo para gaming"                                 │
│       │                                                         │
│       ▼                                                         │
│  SemanticSearchService.search(query)                           │
│       │                                                         │
│       ▼                                                         │
│  EmbeddingService.generateEmbedding(query) → float[384]        │
│       │                                                         │
│       ▼                                                         │
│  SELECT * FROM products ORDER BY embedding <-> $1 LIMIT 10     │
│       │                                                         │
│       ▼                                                         │
│  Returns: "Silla Gamer", "Teclado RGB", "Monitor 144Hz"        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

**Migration file:** `V{next}__add_semantic_search.sql`

```sql
-- Enable pgvector extension (requires superuser or cloud provider support)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to products
ALTER TABLE public.products 
ADD COLUMN embedding vector(384);

-- Create index for fast similarity search (IVFFlat for large datasets)
CREATE INDEX idx_products_embedding ON public.products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Alternative: HNSW index (faster queries, slower builds)
-- CREATE INDEX idx_products_embedding ON public.products 
-- USING hnsw (embedding vector_cosine_ops);
```

**Update `pegasus_v2_db.sql`** to include the embedding column after applying migration.

---

## 3. Backend Structure

**Package:** `com.pegasus.backend.features.search/`

```
search/
├── controller/
│   └── SemanticSearchController.java
├── service/
│   ├── SemanticSearchService.java
│   └── EmbeddingService.java
├── dto/
│   └── SearchResultResponse.java
├── config/
│   └── EmbeddingConfig.java
└── client/
    └── HuggingFaceClient.java
```

---

## 4. Implementation Patterns

### EmbeddingService (Core)
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingService {
    
    private final HuggingFaceClient huggingFaceClient;
    
    /**
     * Generate embedding vector for text
     * @param text Product name + description combined
     * @return float array of 384 dimensions
     */
    public float[] generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return new float[384]; // Zero vector for empty text
        }
        
        String cleanText = text.trim().substring(0, Math.min(text.length(), 512));
        log.debug("Generating embedding for: {}", cleanText.substring(0, Math.min(50, cleanText.length())));
        
        return huggingFaceClient.embed(cleanText);
    }
}
```

### SemanticSearchService
```java
@Service
@RequiredArgsConstructor
public class SemanticSearchService {
    
    private final EmbeddingService embeddingService;
    private final ProductRepository productRepository;
    
    public List<ProductResponse> search(String query, int limit) {
        float[] queryVector = embeddingService.generateEmbedding(query);
        
        // Native query with pgvector
        return productRepository.findBySemanticSimilarity(queryVector, limit);
    }
}
```

### Repository Query
```java
@Query(value = """
    SELECT p.* FROM products p 
    WHERE p.embedding IS NOT NULL AND p.is_active = true
    ORDER BY p.embedding <-> CAST(:embedding AS vector)
    LIMIT :limit
    """, nativeQuery = true)
List<Product> findBySemanticSimilarity(
    @Param("embedding") float[] embedding, 
    @Param("limit") int limit
);
```

---

## 5. API Endpoints

**Semantic Search:**
```
GET /api/search/semantic?q={query}&limit={limit}

Response:
{
  "query": "algo para gaming",
  "results": [
    { "id": 1, "name": "Silla Gamer Pro", "score": 0.89 },
    { "id": 2, "name": "Teclado Mecánico RGB", "score": 0.85 }
  ],
  "totalResults": 2
}
```

**Trigger Re-indexing (Admin only):**
```
POST /api/admin/search/reindex
```

---

## 6. Frontend Integration

**Location:** `features/storefront/search/`

```
search/
├── api/
│   └── searchApi.ts
├── hooks/
│   └── useSemanticSearch.ts
├── components/
│   └── SearchBar.tsx
└── index.ts
```

**SearchBar Enhancement:**
```tsx
// When user types, debounce and call semantic search
const { data, isLoading } = useSemanticSearch(debouncedQuery);

// Display results with relevance indicator
{data?.results.map(product => (
  <SearchResult key={product.id} product={product} />
))}
```

---

## 7. Configuration

**Environment Variables:**
```properties
# application.properties
ai.embedding.provider=huggingface
ai.embedding.api-url=https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2
ai.embedding.api-key=${HUGGINGFACE_API_KEY}
ai.embedding.enabled=true
```

**Feature Flag:**
```java
@Value("${ai.embedding.enabled:false}")
private boolean embeddingEnabled;

// In ProductService.save()
if (embeddingEnabled) {
    float[] embedding = embeddingService.generateEmbedding(product.getName() + " " + product.getDescription());
    product.setEmbedding(embedding);
}
```

---

## 8. Graceful Degradation

**Rule:** AI failure MUST NOT break the application.

```java
public float[] generateEmbedding(String text) {
    try {
        return huggingFaceClient.embed(text);
    } catch (Exception e) {
        log.error("Embedding generation failed, returning null: {}", e.getMessage());
        return null; // Product saved without embedding, still searchable via traditional search
    }
}
```

**Search Fallback:**
```java
public List<ProductResponse> search(String query, int limit) {
    if (!embeddingEnabled) {
        return traditionalSearch(query, limit); // LIKE-based search
    }
    
    try {
        return semanticSearch(query, limit);
    } catch (Exception e) {
        log.warn("Semantic search failed, falling back to traditional: {}", e.getMessage());
        return traditionalSearch(query, limit);
    }
}
```

---

## 9. Testing Strategy

**Unit Tests:**
- Mock HuggingFace responses
- Test embedding dimension validation (must be 384)
- Test null/empty text handling

**Integration Tests:**
- Verify pgvector extension is available
- Test actual similarity queries
- Verify fallback behavior

---

## 10. Cost Considerations

| Provider | Cost | Rate Limit | Notes |
|----------|------|------------|-------|
| HuggingFace (free) | $0 | 30k tokens/month | Good for MVP |
| OpenAI text-embedding-3-small | $0.02/1M tokens | High | Production-ready |
| Local (sentence-transformers) | $0 | Unlimited | Requires more setup |

**Recommendation for MVP:** Start with HuggingFace free tier. Switch to OpenAI or local if limits are hit.

---

## 11. Checklist Before Implementation

- [ ] Phase 1 complete (storefront functional end-to-end)
- [ ] pgvector extension available in your PostgreSQL
- [ ] HuggingFace API key obtained (free account)
- [ ] Products have meaningful names and descriptions
- [ ] Traditional search (LIKE) already works as fallback
