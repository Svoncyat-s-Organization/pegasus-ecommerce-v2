import { useQuery } from '@tanstack/react-query';
import {
  getVariantsByProduct,
  getProductImages,
  getVariantImages,
  getVariantStock,
} from '../api/variantsApi';

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

/**
 * Hook to fetch product images
 */
export const useProductImages = (productId: number) => {
  return useQuery({
    queryKey: ['product-images', productId],
    queryFn: () => getProductImages(productId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!productId,
  });
};

/**
 * Hook to fetch variant images
 */
export const useVariantImages = (variantId: number | null) => {
  return useQuery({
    queryKey: ['variant-images', variantId],
    queryFn: () => (variantId ? getVariantImages(variantId) : Promise.resolve([])),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!variantId,
  });
};

/**
 * Hook to fetch variant total stock
 */
export const useVariantStock = (variantId: number | null) => {
  return useQuery({
    queryKey: ['variant-stock', variantId],
    queryFn: () => (variantId ? getVariantStock(variantId) : Promise.resolve(0)),
    staleTime: 1000 * 60 * 1, // 1 minute (stock changes frequently)
    enabled: !!variantId,
  });
};
