import { api } from '@config/api';

/**
 * Recommendation item returned by the API
 */
export interface RecommendationItem {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  categoryName: string | null;
  brandId: number | null;
  brandName: string | null;
  minPrice: number;
  primaryImageUrl: string | null;
  similarityScore: number | null;
  reason: 'CONTENT_SIMILARITY' | 'SAME_CATEGORY' | 'SAME_BRAND' | 'FEATURED' | 'RANDOM';
}

/**
 * Response from the recommendations API
 */
export interface RecommendationResponse {
  productId: number;
  productName: string;
  recommendations: RecommendationItem[];
  totalRecommendations: number;
  method: 'AI_EMBEDDING' | 'CATEGORY_FALLBACK' | 'BRAND_FALLBACK' | 'FEATURED_FALLBACK' | 'MIXED_FALLBACK';
}

/**
 * Get similar products for a given product
 * GET /api/recommendations/similar/{productId}
 * 
 * @param productId - The product ID to find recommendations for
 * @param limit - Maximum number of recommendations (default: 6, max: 12)
 */
export const getSimilarProducts = async (
  productId: number,
  limit = 6
): Promise<RecommendationResponse> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });
  const { data } = await api.get<RecommendationResponse>(
    `/recommendations/similar/${productId}?${params}`
  );
  return data;
};
