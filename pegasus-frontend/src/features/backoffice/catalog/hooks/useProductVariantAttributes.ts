import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  AssignVariantAttributeRequest,
  SaveProductVariantAttributeRequest,
} from '@types';
import {
  getProductVariantAttributes,
  assignVariantAttribute,
  unassignVariantAttribute,
  updateCustomOptions,
  saveAllProductVariantAttributes,
  reorderProductVariantAttributes,
} from '../api/productVariantAttributesApi';

/**
 * Hook para obtener atributos asignados a un producto
 */
export const useProductVariantAttributes = (productId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['productVariantAttributes', productId],
    queryFn: () => getProductVariantAttributes(productId),
    enabled: options?.enabled !== undefined ? options.enabled : !!productId,
  });
};

/**
 * Hook para asignar un atributo a un producto
 */
export const useAssignVariantAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: number;
      data: AssignVariantAttributeRequest;
    }) => assignVariantAttribute(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productVariantAttributes', productId] });
      message.success('Atributo asignado exitosamente');
    },
    onError: () => {
      message.error('Error al asignar el atributo');
    },
  });
};

/**
 * Hook para desasignar un atributo de un producto
 */
export const useUnassignVariantAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      assignmentId,
    }: {
      productId: number;
      assignmentId: number;
    }) => unassignVariantAttribute(productId, assignmentId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productVariantAttributes', productId] });
      message.success('Atributo desasignado exitosamente');
    },
    onError: () => {
      message.error('Error al desasignar el atributo');
    },
  });
};

/**
 * Hook para actualizar opciones personalizadas
 */
export const useUpdateCustomOptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      assignmentId,
      customOptions,
    }: {
      productId: number;
      assignmentId: number;
      customOptions: string[];
    }) => updateCustomOptions(productId, assignmentId, customOptions),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productVariantAttributes', productId] });
      message.success('Opciones actualizadas exitosamente');
    },
    onError: () => {
      message.error('Error al actualizar las opciones');
    },
  });
};

/**
 * Hook para guardar todas las asignaciones de un producto (batch)
 */
export const useSaveAllProductVariantAttributes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: number;
      data: SaveProductVariantAttributeRequest[];
    }) => saveAllProductVariantAttributes(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productVariantAttributes', productId] });
      message.success('Atributos guardados exitosamente');
    },
    onError: () => {
      message.error('Error al guardar los atributos');
    },
  });
};

/**
 * Hook para reordenar asignaciones
 */
export const useReorderProductVariantAttributes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      assignmentIds,
    }: {
      productId: number;
      assignmentIds: number[];
    }) => reorderProductVariantAttributes(productId, assignmentIds),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['productVariantAttributes', productId] });
    },
    onError: () => {
      message.error('Error al reordenar los atributos');
    },
  });
};
