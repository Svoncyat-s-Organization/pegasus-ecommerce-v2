import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { BrandResponse, CreateBrandRequest, UpdateBrandRequest } from '@types';
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
} from '../api/brandsApi';

/**
 * Hook para listar marcas con paginación y búsqueda
 */
export const useBrands = (page = 0, size = 20, search?: string) => {
  return useQuery({
    queryKey: ['brands', page, size, search],
    queryFn: () => getBrands(page, size, search),
  });
};

/**
 * Hook para obtener una marca por ID
 */
export const useBrand = (id: number) => {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => getBrandById(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear marca
 */
export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBrandRequest) => createBrand(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      message.success('Marca creada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear marca');
    },
  });
};

/**
 * Hook para actualizar marca
 */
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateBrandRequest }) =>
      updateBrand(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands', variables.id] });
      message.success('Marca actualizada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar marca');
    },
  });
};

/**
 * Hook para eliminar marca (soft delete)
 */
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      message.success('Marca eliminada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar marca');
    },
  });
};

/**
 * Hook para alternar estado de marca
 */
export const useToggleBrandStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleBrandStatus(id),
    onSuccess: (data: BrandResponse) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands', data.id] });
      message.success(`Marca ${data.isActive ? 'activada' : 'desactivada'} exitosamente`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al cambiar estado de marca');
    },
  });
};
