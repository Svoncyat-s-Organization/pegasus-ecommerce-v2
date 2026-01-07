import { useQuery } from '@tanstack/react-query';
import { getProducts, getFeaturedProducts, getProductsByCategory, getProductsByBrand } from '../api/catalogApi';

/**
 * Hook para obtener productos con paginación y búsqueda
 */
export const useProducts = (page = 0, size = 20, search?: string) => {
  return useQuery({
    queryKey: ['products', page, size, search],
    queryFn: () => getProducts(page, size, search),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useFilteredProducts = (
  page = 0,
  size = 20,
  search?: string,
  categoryIds?: number[],
  brandIds?: number[]
) => {
  const normalizedCategoryIds = categoryIds && categoryIds.length > 0 ? categoryIds : undefined;
  const normalizedBrandIds = brandIds && brandIds.length > 0 ? brandIds : undefined;

  return useQuery({
    queryKey: ['products', page, size, search, normalizedCategoryIds, normalizedBrandIds],
    queryFn: () => getProducts(page, size, search, normalizedCategoryIds, normalizedBrandIds),
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook para obtener productos destacados
 */
export const useFeaturedProducts = (page = 0, size = 12) => {
  return useQuery({
    queryKey: ['featured-products', page, size],
    queryFn: () => getFeaturedProducts(page, size),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook para obtener productos por categoría
 */
export const useProductsByCategory = (categoryId: number, page = 0, size = 20) => {
  return useQuery({
    queryKey: ['products-by-category', categoryId, page, size],
    queryFn: () => getProductsByCategory(categoryId, page, size),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook para obtener productos por marca
 */
export const useProductsByBrand = (brandId: number, page = 0, size = 20) => {
  return useQuery({
    queryKey: ['products-by-brand', brandId, page, size],
    queryFn: () => getProductsByBrand(brandId, page, size),
    enabled: !!brandId,
    staleTime: 1000 * 60 * 2,
  });
};
