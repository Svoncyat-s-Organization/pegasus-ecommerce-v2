import { api } from '@config/api';
import type { VariantResponse } from '@types';

/**
 * Get variants by product ID
 */
export const getVariantsByProduct = async (productId: number): Promise<VariantResponse[]> => {
  const { data } = await api.get(`/admin/variants/by-product/${productId}`);
  return data;
};
