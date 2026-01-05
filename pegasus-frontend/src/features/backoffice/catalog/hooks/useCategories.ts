import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@types';
import {
  getCategories,
  getRootCategories,
  getSubcategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from '../api/categoriesApi';

/**
 * Hook para listar categorías con paginación y búsqueda
 */
export const useCategories = (page = 0, size = 20, search?: string) => {
  return useQuery({
    queryKey: ['categories', page, size, search],
    queryFn: () => getCategories(page, size, search),
  });
};

/**
 * Hook para obtener categorías raíz (sin padre)
 */
export const useRootCategories = () => {
  return useQuery({
    queryKey: ['categories', 'root'],
    queryFn: () => getRootCategories(),
  });
};

/**
 * Hook para obtener subcategorías de una categoría padre
 */
export const useSubcategories = (parentId: number) => {
  return useQuery({
    queryKey: ['categories', 'subcategories', parentId],
    queryFn: () => getSubcategories(parentId),
    enabled: !!parentId,
  });
};

/**
 * Hook para obtener una categoría por ID
 */
export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear categoría
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCategoryRequest) => createCategory(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Categoría creada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear categoría');
    },
  });
};

/**
 * Hook para actualizar categoría
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateCategoryRequest }) =>
      updateCategory(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
      message.success('Categoría actualizada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar categoría');
    },
  });
};

/**
 * Hook para eliminar categoría (soft delete)
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Categoría eliminada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar categoría');
    },
  });
};

/**
 * Hook para alternar estado de categoría
 */
export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleCategoryStatus(id),
    onSuccess: (data: CategoryResponse) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', data.id] });
      message.success(`Categoría ${data.isActive ? 'activada' : 'desactivada'} exitosamente`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al cambiar estado de categoría');
    },
  });
};
