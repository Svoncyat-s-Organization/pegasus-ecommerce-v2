import { api } from '@config/api';
import type { PageResponse, ProductResponse, CategoryResponse, BrandResponse } from '@types';

/**
 * Get all products with pagination and search
 * GET /api/admin/products
 */
export const getProducts = async (
  page = 0,
  size = 20,
  search?: string
): Promise<PageResponse<ProductResponse>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    ...(search && { search }),
  });
  const { data } = await api.get<PageResponse<ProductResponse>>(`/admin/products?${params}`);
  return data;
};

/**
 * Get featured products
 * GET /api/admin/products/featured
 */
export const getFeaturedProducts = async (
  page = 0,
  size = 12
): Promise<PageResponse<ProductResponse>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  const { data } = await api.get<PageResponse<ProductResponse>>(
    `/admin/products/featured?${params}`
  );
  return data;
};

/**
 * Get products by category
 * GET /api/admin/products/by-category/{categoryId}
 */
export const getProductsByCategory = async (
  categoryId: number,
  page = 0,
  size = 20
): Promise<PageResponse<ProductResponse>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  const { data } = await api.get<PageResponse<ProductResponse>>(
    `/admin/products/by-category/${categoryId}?${params}`
  );
  return data;
};

/**
 * Get products by brand
 * GET /api/admin/products/by-brand/{brandId}
 */
export const getProductsByBrand = async (
  brandId: number,
  page = 0,
  size = 20
): Promise<PageResponse<ProductResponse>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  const { data } = await api.get<PageResponse<ProductResponse>>(
    `/admin/products/by-brand/${brandId}?${params}`
  );
  return data;
};

/**
 * Get product by ID
 * GET /api/admin/products/{id}
 */
export const getProductById = async (id: number): Promise<ProductResponse> => {
  const { data } = await api.get<ProductResponse>(`/admin/products/${id}`);
  return data;
};

/**
 * Get all categories (root categories for navigation)
 * GET /api/admin/categories/root
 */
export const getRootCategories = async (): Promise<CategoryResponse[]> => {
  const { data } = await api.get<CategoryResponse[]>('/admin/categories/root');
  return data;
};

/**
 * Get subcategories by parent category ID
 * GET /api/admin/categories/{id}/subcategories
 */
export const getSubcategories = async (categoryId: number): Promise<CategoryResponse[]> => {
  const { data } = await api.get<CategoryResponse[]>(
    `/admin/categories/${categoryId}/subcategories`
  );
  return data;
};

/**
 * Get category by ID
 * GET /api/admin/categories/{id}
 */
export const getCategoryById = async (id: number): Promise<CategoryResponse> => {
  const { data } = await api.get<CategoryResponse>(`/admin/categories/${id}`);
  return data;
};

/**
 * Get all brands
 * GET /api/admin/brands
 */
export const getAllBrands = async (): Promise<BrandResponse[]> => {
  const { data } = await api.get<PageResponse<BrandResponse>>('/admin/brands?size=100');
  return data.content;
};
