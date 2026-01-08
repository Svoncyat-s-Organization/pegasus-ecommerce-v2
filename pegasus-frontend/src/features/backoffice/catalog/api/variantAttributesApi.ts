import { api } from '@config/api';
import type {
  VariantAttributeResponse,
  CreateVariantAttributeRequest,
  UpdateVariantAttributeRequest,
  PageResponse,
} from '@types';

/**
 * Obtener atributos con paginación y búsqueda
 */
export const getVariantAttributes = async (
  page = 0,
  size = 20,
  search?: string
): Promise<PageResponse<VariantAttributeResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (search) params.append('search', search);
  
  const { data } = await api.get(`/admin/variant-attributes?${params.toString()}`);
  return data;
};

/**
 * Obtener todos los atributos activos (para selects)
 */
export const getAllActiveVariantAttributes = async (): Promise<VariantAttributeResponse[]> => {
  const { data } = await api.get('/admin/variant-attributes/all');
  return data;
};

/**
 * Obtener atributo por ID
 */
export const getVariantAttributeById = async (id: number): Promise<VariantAttributeResponse> => {
  const { data } = await api.get(`/admin/variant-attributes/${id}`);
  return data;
};

/**
 * Obtener atributo por nombre
 */
export const getVariantAttributeByName = async (name: string): Promise<VariantAttributeResponse> => {
  const { data } = await api.get(`/admin/variant-attributes/name/${name}`);
  return data;
};

/**
 * Obtener atributos por tipo
 */
export const getVariantAttributesByType = async (
  type: 'TEXT' | 'COLOR' | 'SIZE' | 'NUMBER'
): Promise<VariantAttributeResponse[]> => {
  const { data } = await api.get(`/admin/variant-attributes/type/${type}`);
  return data;
};

/**
 * Crear un atributo
 */
export const createVariantAttribute = async (
  request: CreateVariantAttributeRequest
): Promise<VariantAttributeResponse> => {
  const { data } = await api.post('/admin/variant-attributes', request);
  return data;
};

/**
 * Actualizar un atributo
 */
export const updateVariantAttribute = async (
  id: number,
  request: UpdateVariantAttributeRequest
): Promise<VariantAttributeResponse> => {
  const { data } = await api.put(`/admin/variant-attributes/${id}`, request);
  return data;
};

/**
 * Eliminar un atributo (soft delete)
 */
export const deleteVariantAttribute = async (id: number): Promise<void> => {
  await api.delete(`/admin/variant-attributes/${id}`);
};

/**
 * Obtener múltiples atributos por IDs
 */
export const getVariantAttributesByIds = async (ids: number[]): Promise<VariantAttributeResponse[]> => {
  const { data } = await api.post('/admin/variant-attributes/by-ids', ids);
  return data;
};
