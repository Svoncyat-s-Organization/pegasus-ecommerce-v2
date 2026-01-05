import { useQuery } from '@tanstack/react-query';
import { getVariantsByProduct } from '../api/variantsApi';

/**
 * Hook to fetch product variants
 */
export const useProductVariants = (productId: number) => {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: () => getVariantsByProduct(productId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!productId,
  });
};
