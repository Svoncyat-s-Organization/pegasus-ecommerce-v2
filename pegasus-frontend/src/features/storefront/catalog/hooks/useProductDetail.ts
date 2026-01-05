import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../api/catalogApi';

/**
 * Hook para obtener detalle de un producto por ID
 */
export const useProductDetail = (productId: number) => {
  return useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId && productId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
