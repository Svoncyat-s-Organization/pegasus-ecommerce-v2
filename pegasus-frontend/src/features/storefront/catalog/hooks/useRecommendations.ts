import { useQuery } from '@tanstack/react-query';
import { getSimilarProducts, type RecommendationResponse } from '../api/recommendationApi';

/**
 * Hook to fetch similar product recommendations
 * 
 * @param productId - The product ID to find recommendations for
 * @param limit - Maximum number of recommendations (default: 6)
 * @param enabled - Whether the query should run (default: true)
 */
export const useRecommendations = (
  productId: number | undefined,
  limit = 6,
  enabled = true
) => {
  return useQuery<RecommendationResponse>({
    queryKey: ['recommendations', productId, limit],
    queryFn: () => getSimilarProducts(productId!, limit),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Only retry once since recommendations are not critical
  });
};
