import { api } from '@config/api';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest, PageResponse } from '@types';

/**
 * Obtener todas las categorías con paginación y búsqueda
 */
export const getCategories = async (
  page = 0,
  size = 20,
  search?: string
): Promise<PageResponse<CategoryResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (search) params.append('search', search);
  
  const { data } = await api.get(`/admin/categories?${params.toString()}`);
  return data;
};

/**
 * Obtener categoría por ID
 */
export const getCategoryById = async (id: number): Promise<CategoryResponse> => {
  const { data } = await api.get(`/admin/categories/${id}`);
  return data;
};

/**
 * Obtener categorías en estructura jerárquica (árbol)
 */
export const getCategoriesTree = async (): Promise<CategoryResponse[]> => {
  const { data } = await api.get('/admin/categories/tree');
  return data;
};

/**
 * Obtener categorías raíz (sin padre)
 */
export const getRootCategories = async (): Promise<CategoryResponse[]> => {
  const { data } = await api.get('/admin/categories/root');
  return data;
};

/**
 * Obtener subcategorías de una categoría padre
 */
export const getSubcategories = async (parentId: number): Promise<CategoryResponse[]> => {
  const { data } = await api.get(`/admin/categories/${parentId}/subcategories`);
  return data;
};

/**
 * Crear nueva categoría
 */
export const createCategory = async (request: CreateCategoryRequest): Promise<CategoryResponse> => {
  const { data } = await api.post('/admin/categories', request);
  return data;
};

/**
 * Actualizar categoría existente
 */
export const updateCategory = async (
  id: number,
  request: UpdateCategoryRequest
): Promise<CategoryResponse> => {
  const { data } = await api.put(`/admin/categories/${id}`, request);
  return data;
};

/**
 * Eliminar categoría (eliminación física permanente)
 */
export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};

/**
 * Alternar estado activo/inactivo
 */
export const toggleCategoryStatus = async (id: number): Promise<CategoryResponse> => {
  const { data } = await api.put(`/admin/categories/${id}/toggle-status`);
  return data;
};

/**
 * Generar slug a partir de un nombre
 */
export const generateSlug = async (name: string): Promise<string> => {
  const { data } = await api.get(`/admin/categories/generate-slug`, {
    params: { name },
  });
  return data;
};
