import { api } from '@config/api';
import type { ImageResponse, CreateImageRequest, UpdateImageRequest } from '@types';

/**
 * Obtener todas las imágenes de un producto
 */
export const getImagesByProductId = async (productId: number): Promise<ImageResponse[]> => {
  const { data } = await api.get(`/admin/images/by-product/${productId}`);
  return data;
};

/**
 * Obtener todas las imágenes de una variante
 */
export const getImagesByVariantId = async (variantId: number): Promise<ImageResponse[]> => {
  const { data } = await api.get(`/admin/images/by-variant/${variantId}`);
  return data;
};

/**
 * Obtener imagen por ID
 */
export const getImageById = async (id: number): Promise<ImageResponse> => {
  const { data } = await api.get(`/admin/images/${id}`);
  return data;
};

/**
 * Crear nueva imagen
 */
export const createImage = async (request: CreateImageRequest): Promise<ImageResponse> => {
  const { data } = await api.post('/admin/images', request);
  return data;
};

/**
 * Actualizar imagen existente
 */
export const updateImage = async (id: number, request: UpdateImageRequest): Promise<ImageResponse> => {
  const { data } = await api.put(`/admin/images/${id}`, request);
  return data;
};

/**
 * Eliminar imagen
 */
export const deleteImage = async (id: number): Promise<void> => {
  await api.delete(`/admin/images/${id}`);
};
