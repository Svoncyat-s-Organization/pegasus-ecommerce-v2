import { api } from '@config/api';
import type { BrandResponse, CreateBrandRequest, UpdateBrandRequest, PageResponse } from '@types';

/**
 * Obtener todas las marcas con paginación y búsqueda
 */
export const getBrands = async (
  page = 0,
  size = 20,
  search?: string
): Promise<PageResponse<BrandResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (search) params.append('search', search);
  
  const { data } = await api.get(`/admin/brands?${params.toString()}`);
  return data;
};

/**
 * Obtener marca por ID
 */
export const getBrandById = async (id: number): Promise<BrandResponse> => {
  const { data } = await api.get(`/admin/brands/${id}`);
  return data;
};

/**
 * Crear nueva marca
 */
export const createBrand = async (request: CreateBrandRequest): Promise<BrandResponse> => {
  const { data } = await api.post('/admin/brands', request);
  return data;
};

/**
 * Actualizar marca existente
 */
export const updateBrand = async (id: number, request: UpdateBrandRequest): Promise<BrandResponse> => {
  const { data } = await api.put(`/admin/brands/${id}`, request);
  return data;
};

/**
 * Eliminar marca (eliminación física permanente)
 */
export const deleteBrand = async (id: number): Promise<void> => {
  await api.delete(`/admin/brands/${id}`);
};

/**
 * Alternar estado activo/inactivo
 */
export const toggleBrandStatus = async (id: number): Promise<BrandResponse> => {
  const { data } = await api.put(`/admin/brands/${id}/toggle-status`);
  return data;
};

/**
 * Generar slug a partir de un nombre
 */
export const generateSlug = async (name: string): Promise<string> => {
  const { data } = await api.get(`/admin/brands/generate-slug`, {
    params: { name },
  });
  return data;
};
