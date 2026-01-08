import { api } from '@config/api';
import type { VariantResponse, VariantWithStockResponse, CreateVariantRequest, UpdateVariantRequest, PageResponse } from '@types';

/**
 * Obtener todas las variantes con paginación y búsqueda
 */
export const getVariants = async (
  page = 0,
  size = 20,
  search?: string
): Promise<PageResponse<VariantResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (search) params.append('search', search);
  
  const { data } = await api.get(`/admin/variants?${params.toString()}`);
  return data;
};

/**
 * Obtener variante por ID
 */
export const getVariantById = async (id: number): Promise<VariantResponse> => {
  const { data } = await api.get(`/admin/variants/${id}`);
  return data;
};

/**
 * Obtener variantes de un producto
 */
export const getVariantsByProductId = async (productId: number): Promise<VariantResponse[]> => {
  const { data } = await api.get(`/admin/variants/by-product/${productId}`);
  return data;
};

/**
 * Obtener variantes activas de un producto
 */
export const getActiveVariantsByProductId = async (productId: number): Promise<VariantResponse[]> => {
  const { data } = await api.get(`/admin/variants/by-product/${productId}/active`);
  return data;
};

/**
 * Obtener variantes con stock disponible
 */
export const getVariantsWithStock = async (
  page = 0,
  size = 1000,
  search?: string
): Promise<PageResponse<VariantWithStockResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (search) params.append('search', search);
  
  const { data } = await api.get(`/admin/variants/with-stock?${params.toString()}`);
  return data;
};

/**
 * Crear nueva variante
 */
export const createVariant = async (request: CreateVariantRequest): Promise<VariantResponse> => {
  const { data } = await api.post('/admin/variants', request);
  return data;
};

/**
 * Actualizar variante existente
 */
export const updateVariant = async (
  id: number,
  request: UpdateVariantRequest
): Promise<VariantResponse> => {
  const { data } = await api.put(`/admin/variants/${id}`, request);
  return data;
};

/**
 * Eliminar variante (soft delete)
 */
export const deleteVariant = async (id: number): Promise<void> => {
  await api.delete(`/admin/variants/${id}`);
};

/**
 * Eliminar variante permanentemente (hard delete)
 */
export const hardDeleteVariant = async (id: number): Promise<void> => {
  await api.delete(`/admin/variants/${id}/hard`);
};

/**
 * Alternar estado activo/inactivo
 */
export const toggleVariantStatus = async (id: number): Promise<VariantResponse> => {
  const { data } = await api.put(`/admin/variants/${id}/toggle-status`);
  return data;
};
