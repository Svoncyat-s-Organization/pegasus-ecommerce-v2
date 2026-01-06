import { api } from '@config/api';
import type { VariantResponse, ImageResponse } from '@types';

/**
 * Get active variants by product ID (public endpoint)
 * GET /api/public/catalog/products/{productId}/variants
 */
export const getVariantsByProduct = async (productId: number): Promise<VariantResponse[]> => {
  const { data } = await api.get<VariantResponse[]>(`/public/catalog/products/${productId}/variants`);
  return data;
};

/**
 * Get images by product ID (public endpoint)
 * GET /api/public/catalog/products/{productId}/images
 */
export const getProductImages = async (productId: number): Promise<ImageResponse[]> => {
  const { data } = await api.get<ImageResponse[]>(`/public/catalog/products/${productId}/images`);
  return data;
};

/**
 * Get images by variant ID (public endpoint)
 * GET /api/public/catalog/variants/{variantId}/images
 */
export const getVariantImages = async (variantId: number): Promise<ImageResponse[]> => {
  const { data } = await api.get<ImageResponse[]>(`/public/catalog/variants/${variantId}/images`);
  return data;
};

/**
 * Get total stock for variant (public endpoint)
 * GET /api/public/catalog/variants/{variantId}/stock
 */
export const getVariantStock = async (variantId: number): Promise<number> => {
  const { data } = await api.get<number>(`/public/catalog/variants/${variantId}/stock`);
  return data;
};
