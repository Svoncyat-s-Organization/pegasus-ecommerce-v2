import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { ImageResponse, CreateImageRequest, UpdateImageRequest } from '@types';
import {
  getImagesByProductId,
  getImagesByVariantId,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
} from '../api/imagesApi';

/**
 * Hook para obtener imágenes de un producto
 */
export const useImagesByProduct = (productId: number) => {
  return useQuery({
    queryKey: ['images', 'product', productId],
    queryFn: () => getImagesByProductId(productId),
    enabled: !!productId,
  });
};

/**
 * Hook para obtener imágenes de una variante
 */
export const useImagesByVariant = (variantId: number) => {
  return useQuery({
    queryKey: ['images', 'variant', variantId],
    queryFn: () => getImagesByVariantId(variantId),
    enabled: !!variantId,
  });
};

/**
 * Hook para obtener una imagen por ID
 */
export const useImage = (id: number) => {
  return useQuery({
    queryKey: ['images', id],
    queryFn: () => getImageById(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear imagen
 */
export const useCreateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateImageRequest) => createImage(request),
    onSuccess: (data: ImageResponse) => {
      if (data.productId) {
        queryClient.invalidateQueries({ queryKey: ['images', 'product', data.productId] });
      }
      if (data.variantId) {
        queryClient.invalidateQueries({ queryKey: ['images', 'variant', data.variantId] });
      }
      message.success('Imagen creada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear imagen');
    },
  });
};

/**
 * Hook para actualizar imagen
 */
export const useUpdateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateImageRequest }) =>
      updateImage(id, request),
    onSuccess: (data: ImageResponse, variables: { id: number; request: UpdateImageRequest }) => {
      queryClient.invalidateQueries({ queryKey: ['images', variables.id] });
      if (data.productId) {
        queryClient.invalidateQueries({ queryKey: ['images', 'product', data.productId] });
      }
      if (data.variantId) {
        queryClient.invalidateQueries({ queryKey: ['images', 'variant', data.variantId] });
      }
      message.success('Imagen actualizada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar imagen');
    },
  });
};

/**
 * Hook para eliminar imagen
 */
export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      message.success('Imagen eliminada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar imagen');
    },
  });
};
