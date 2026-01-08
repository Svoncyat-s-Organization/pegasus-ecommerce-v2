import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { ProductResponse, CreateProductRequest, UpdateProductRequest } from '@types';
import {
  getProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductsByBrand,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from '../api/productsApi';

/**
 * Hook para listar productos con paginación y búsqueda
 */
export const useProducts = (page = 0, size = 20, search?: string) => {
  return useQuery({
    queryKey: ['products', page, size, search],
    queryFn: () => getProducts(page, size, search),
  });
};

/**
 * Hook para obtener productos destacados
 */
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getFeaturedProducts(),
  });
};

/**
 * Hook para obtener productos por categoría
 */
export const useProductsByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => getProductsByCategory(categoryId),
    enabled: !!categoryId,
  });
};

/**
 * Hook para obtener productos por marca
 */
export const useProductsByBrand = (brandId: number) => {
  return useQuery({
    queryKey: ['products', 'brand', brandId],
    queryFn: () => getProductsByBrand(brandId),
    enabled: !!brandId,
  });
};

/**
 * Hook para obtener un producto por ID
 */
export const useProduct = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProductById(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

/**
 * Hook para crear producto
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateProductRequest) => createProduct(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Producto creado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear producto');
    },
  });
};

/**
 * Hook para actualizar producto
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateProductRequest }) =>
      updateProduct(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      message.success('Producto actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar producto');
    },
  });
};

/**
 * Hook para eliminar producto (soft delete)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Producto eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar producto');
    },
  });
};

/**
 * Hook para alternar estado de producto
 */
export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleProductStatus(id),
    onSuccess: (data: ProductResponse) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
      message.success(`Producto ${data.isActive ? 'activado' : 'desactivado'} exitosamente`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al cambiar estado de producto');
    },
  });
};
