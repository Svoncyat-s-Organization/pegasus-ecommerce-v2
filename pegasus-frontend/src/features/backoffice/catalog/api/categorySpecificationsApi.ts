import { api } from '@config/api';
import type {
  CategorySpecificationResponse,
  CreateCategorySpecificationRequest,
  UpdateCategorySpecificationRequest,
  SaveCategorySpecificationRequest,
} from '@types';

/**
 * Obtener especificaciones de una categoría (sin herencia)
 */
export const getCategorySpecifications = async (
  categoryId: number
): Promise<CategorySpecificationResponse[]> => {
  const { data } = await api.get(`/admin/categories/${categoryId}/specifications`);
  return data;
};

/**
 * Obtener especificaciones incluyendo heredadas de categorías padre
 */
export const getCategorySpecificationsWithInheritance = async (
  categoryId: number
): Promise<CategorySpecificationResponse[]> => {
  const { data } = await api.get(`/admin/categories/${categoryId}/specifications/with-inheritance`);
  return data;
};

/**
 * Obtener especificación por ID
 */
export const getCategorySpecificationById = async (
  categoryId: number,
  id: number
): Promise<CategorySpecificationResponse> => {
  const { data } = await api.get(`/admin/categories/${categoryId}/specifications/${id}`);
  return data;
};

/**
 * Crear una especificación
 */
export const createCategorySpecification = async (
  categoryId: number,
  request: CreateCategorySpecificationRequest
): Promise<CategorySpecificationResponse> => {
  const { data } = await api.post(`/admin/categories/${categoryId}/specifications`, request);
  return data;
};

/**
 * Actualizar una especificación
 */
export const updateCategorySpecification = async (
  categoryId: number,
  id: number,
  request: UpdateCategorySpecificationRequest
): Promise<CategorySpecificationResponse> => {
  const { data } = await api.put(`/admin/categories/${categoryId}/specifications/${id}`, request);
  return data;
};

/**
 * Eliminar una especificación (soft delete)
 */
export const deleteCategorySpecification = async (
  categoryId: number,
  id: number
): Promise<void> => {
  await api.delete(`/admin/categories/${categoryId}/specifications/${id}`);
};

/**
 * Guardar todas las especificaciones de una categoría (batch)
 */
export const saveAllCategorySpecifications = async (
  categoryId: number,
  requests: SaveCategorySpecificationRequest[]
): Promise<CategorySpecificationResponse[]> => {
  const { data } = await api.put(`/admin/categories/${categoryId}/specifications`, requests);
  return data;
};
