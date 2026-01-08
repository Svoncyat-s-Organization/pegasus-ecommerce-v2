import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  CreateCategorySpecificationRequest,
  UpdateCategorySpecificationRequest,
  SaveCategorySpecificationRequest,
} from '@types';
import {
  getCategorySpecifications,
  getCategorySpecificationsWithInheritance,
  getCategorySpecificationById,
  createCategorySpecification,
  updateCategorySpecification,
  deleteCategorySpecification,
  saveAllCategorySpecifications,
} from '../api/categorySpecificationsApi';

/**
 * Hook para listar especificaciones de una categoría (sin herencia)
 */
export const useCategorySpecifications = (categoryId: number) => {
  return useQuery({
    queryKey: ['categorySpecifications', categoryId],
    queryFn: () => getCategorySpecifications(categoryId),
    enabled: !!categoryId,
  });
};

/**
 * Hook para listar especificaciones con herencia (propias + padre)
 */
export const useCategorySpecificationsWithInheritance = (categoryId: number) => {
  return useQuery({
    queryKey: ['categorySpecifications', categoryId, 'withInheritance'],
    queryFn: () => getCategorySpecificationsWithInheritance(categoryId),
    enabled: !!categoryId,
  });
};

/**
 * Hook para obtener una especificación por ID
 */
export const useCategorySpecification = (categoryId: number, id: number) => {
  return useQuery({
    queryKey: ['categorySpecifications', categoryId, id],
    queryFn: () => getCategorySpecificationById(categoryId, id),
    enabled: !!categoryId && !!id,
  });
};

/**
 * Hook para crear una especificación
 */
export const useCreateCategorySpecification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: number;
      data: CreateCategorySpecificationRequest;
    }) => createCategorySpecification(categoryId, data),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categorySpecifications', categoryId] });
      message.success('Especificación creada exitosamente');
    },
    onError: () => {
      message.error('Error al crear la especificación');
    },
  });
};

/**
 * Hook para actualizar una especificación
 */
export const useUpdateCategorySpecification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      id,
      data,
    }: {
      categoryId: number;
      id: number;
      data: UpdateCategorySpecificationRequest;
    }) => updateCategorySpecification(categoryId, id, data),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categorySpecifications', categoryId] });
      message.success('Especificación actualizada exitosamente');
    },
    onError: () => {
      message.error('Error al actualizar la especificación');
    },
  });
};

/**
 * Hook para eliminar una especificación
 */
export const useDeleteCategorySpecification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, id }: { categoryId: number; id: number }) =>
      deleteCategorySpecification(categoryId, id),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categorySpecifications', categoryId] });
      message.success('Especificación eliminada exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar la especificación');
    },
  });
};

/**
 * Hook para guardar todas las especificaciones de una categoría (batch)
 */
export const useSaveAllCategorySpecifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: number;
      data: SaveCategorySpecificationRequest[];
    }) => saveAllCategorySpecifications(categoryId, data),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['categorySpecifications', categoryId] });
      message.success('Especificaciones guardadas exitosamente');
    },
    onError: () => {
      message.error('Error al guardar las especificaciones');
    },
  });
};
