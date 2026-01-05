import { useQuery } from '@tanstack/react-query';
import { getRootCategories, getSubcategories, getCategoryById } from '../api/catalogApi';

/**
 * Hook para obtener categorías raíz (nivel superior)
 */
export const useRootCategories = () => {
  return useQuery({
    queryKey: ['root-categories'],
    queryFn: getRootCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook para obtener subcategorías de una categoría
 */
export const useSubcategories = (categoryId: number) => {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => getSubcategories(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook para obtener detalle de categoría
 */
export const useCategoryDetail = (categoryId: number) => {
  return useQuery({
    queryKey: ['category-detail', categoryId],
    queryFn: () => getCategoryById(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10,
  });
};
