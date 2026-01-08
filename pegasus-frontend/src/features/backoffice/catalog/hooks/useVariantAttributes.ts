import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  CreateVariantAttributeRequest,
  UpdateVariantAttributeRequest,
} from '@types';
import {
  getVariantAttributes,
  getAllActiveVariantAttributes,
  getVariantAttributeById,
  getVariantAttributeByName,
  getVariantAttributesByType,
  createVariantAttribute,
  updateVariantAttribute,
  deleteVariantAttribute,
  getVariantAttributesByIds,
} from '../api/variantAttributesApi';

/**
 * Hook para listar atributos con paginación y búsqueda
 */
export const useVariantAttributes = (page = 0, size = 20, search?: string) => {
  return useQuery({
    queryKey: ['variantAttributes', page, size, search],
    queryFn: () => getVariantAttributes(page, size, search),
  });
};

/**
 * Hook para obtener todos los atributos activos (para selects)
 */
export const useAllActiveVariantAttributes = () => {
  return useQuery({
    queryKey: ['variantAttributes', 'all', 'active'],
    queryFn: () => getAllActiveVariantAttributes(),
  });
};

/**
 * Hook para obtener un atributo por ID
 */
export const useVariantAttribute = (id: number) => {
  return useQuery({
    queryKey: ['variantAttributes', id],
    queryFn: () => getVariantAttributeById(id),
    enabled: !!id,
  });
};

/**
 * Hook para obtener un atributo por nombre
 */
export const useVariantAttributeByName = (name: string) => {
  return useQuery({
    queryKey: ['variantAttributes', 'name', name],
    queryFn: () => getVariantAttributeByName(name),
    enabled: !!name,
  });
};

/**
 * Hook para obtener atributos por tipo
 */
export const useVariantAttributesByType = (type: 'TEXT' | 'COLOR' | 'SIZE' | 'NUMBER') => {
  return useQuery({
    queryKey: ['variantAttributes', 'type', type],
    queryFn: () => getVariantAttributesByType(type),
    enabled: !!type,
  });
};

/**
 * Hook para obtener múltiples atributos por IDs
 */
export const useVariantAttributesByIds = (ids: number[]) => {
  return useQuery({
    queryKey: ['variantAttributes', 'ids', ids],
    queryFn: () => getVariantAttributesByIds(ids),
    enabled: ids.length > 0,
  });
};

/**
 * Hook para crear un atributo
 */
export const useCreateVariantAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVariantAttributeRequest) => createVariantAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variantAttributes'] });
      message.success('Atributo creado exitosamente');
    },
    onError: () => {
      message.error('Error al crear el atributo');
    },
  });
};

/**
 * Hook para actualizar un atributo
 */
export const useUpdateVariantAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVariantAttributeRequest }) =>
      updateVariantAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variantAttributes'] });
      message.success('Atributo actualizado exitosamente');
    },
    onError: () => {
      message.error('Error al actualizar el atributo');
    },
  });
};

/**
 * Hook para eliminar un atributo
 */
export const useDeleteVariantAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteVariantAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variantAttributes'] });
      message.success('Atributo eliminado exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar el atributo');
    },
  });
};
