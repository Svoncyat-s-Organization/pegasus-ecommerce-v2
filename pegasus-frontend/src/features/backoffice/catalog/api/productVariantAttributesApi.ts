import { api } from '@config/api';
import type {
  ProductVariantAttributeResponse,
  AssignVariantAttributeRequest,
  SaveProductVariantAttributeRequest,
} from '@types';

/**
 * Obtener atributos asignados a un producto
 */
export const getProductVariantAttributes = async (
  productId: number
): Promise<ProductVariantAttributeResponse[]> => {
  const { data } = await api.get(`/admin/products/${productId}/variant-attributes`);
  return data;
};

/**
 * Asignar un atributo a un producto
 */
export const assignVariantAttribute = async (
  productId: number,
  request: AssignVariantAttributeRequest
): Promise<ProductVariantAttributeResponse> => {
  const { data } = await api.post(`/admin/products/${productId}/variant-attributes`, request);
  return data;
};

/**
 * Desasignar un atributo de un producto
 */
export const unassignVariantAttribute = async (
  productId: number,
  assignmentId: number
): Promise<void> => {
  await api.delete(`/admin/products/${productId}/variant-attributes/${assignmentId}`);
};

/**
 * Actualizar opciones personalizadas de una asignación
 */
export const updateCustomOptions = async (
  productId: number,
  assignmentId: number,
  customOptions: string[]
): Promise<ProductVariantAttributeResponse> => {
  const { data } = await api.patch(
    `/admin/products/${productId}/variant-attributes/${assignmentId}/custom-options`,
    customOptions
  );
  return data;
};

/**
 * Guardar todas las asignaciones de un producto (batch)
 */
export const saveAllProductVariantAttributes = async (
  productId: number,
  requests: SaveProductVariantAttributeRequest[]
): Promise<ProductVariantAttributeResponse[]> => {
  const { data } = await api.put(`/admin/products/${productId}/variant-attributes`, requests);
  return data;
};

/**
 * Reordenar las asignaciones
 */
export const reorderProductVariantAttributes = async (
  productId: number,
  assignmentIds: number[]
): Promise<ProductVariantAttributeResponse[]> => {
  const { data } = await api.put(`/admin/products/${productId}/variant-attributes/reorder`, assignmentIds);
  return data;
};
