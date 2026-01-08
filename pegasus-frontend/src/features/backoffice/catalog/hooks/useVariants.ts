import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { VariantResponse, CreateVariantRequest, UpdateVariantRequest } from '@types';
import {
  getVariants,
  getVariantById,
  getVariantsByProductId,
  getActiveVariantsByProductId,
  createVariant,
  updateVariant,
  deleteVariant,
  toggleVariantStatus,
} from '../api/variantsApi';

/**
 * Hook para listar variantes con paginación y búsqueda
 */
export const useVariants = (page = 0, size = 20, search?: string) => {
  return useQuery({
    queryKey: ['variants', page, size, search],
    queryFn: () => getVariants(page, size, search),
  });
};

/**
 * Hook para obtener variantes de un producto
 */
export const useVariantsByProduct = (productId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['variants', 'product', productId],
    queryFn: () => getVariantsByProductId(productId),
    enabled: options?.enabled !== undefined ? options.enabled : !!productId,
  });
};

/**
 * Hook para obtener variantes activas de un producto
 */
export const useActiveVariantsByProduct = (productId: number) => {
  return useQuery({
    queryKey: ['variants', 'product', productId, 'active'],
    queryFn: () => getActiveVariantsByProductId(productId),
    enabled: !!productId,
  });
};

/**
 * Hook para obtener una variante por ID
 */
export const useVariant = (id: number) => {
  return useQuery({
    queryKey: ['variants', id],
    queryFn: () => getVariantById(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear variante
 */
export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateVariantRequest) => createVariant(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['variants', 'product', data.productId] });
      message.success('Variante creada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear variante');
    },
  });
};

/**
 * Hook para actualizar variante
 */
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateVariantRequest }) =>
      updateVariant(id, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['variants', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['variants', 'product', data.productId] });
      message.success('Variante actualizada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar variante');
    },
  });
};

/**
 * Hook para eliminar variante (soft delete)
 */
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      message.success('Variante eliminada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar variante');
    },
  });
};

/**
 * Hook para alternar estado de variante
 */
export const useToggleVariantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleVariantStatus(id),
    onSuccess: (data: VariantResponse) => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['variants', data.id] });
      queryClient.invalidateQueries({ queryKey: ['variants', 'product', data.productId] });
      message.success(`Variante ${data.isActive ? 'activada' : 'desactivada'} exitosamente`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al cambiar estado de variante');
    },
  });
};
