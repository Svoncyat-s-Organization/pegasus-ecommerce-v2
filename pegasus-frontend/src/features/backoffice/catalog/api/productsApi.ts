import { api } from '@config/api';
import type { ProductResponse, CreateProductRequest, UpdateProductRequest, PageResponse } from '@types';

/**
 * Obtener todos los productos con paginación y búsqueda
 */
export const getProducts = async (
  page = 0,
  size = 20,
  search?: string
): Promise<PageResponse<ProductResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (search) params.append('search', search);
  
  const { data } = await api.get(`/admin/products?${params.toString()}`);
  return data;
};

/**
 * Obtener producto por ID
 */
export const getProductById = async (id: number): Promise<ProductResponse> => {
  const { data } = await api.get(`/admin/products/${id}`);
  return data;
};

/**
 * Obtener productos destacados
 */
export const getFeaturedProducts = async (page = 0, size = 20): Promise<PageResponse<ProductResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  const { data } = await api.get(`/admin/products/featured?${params.toString()}`);
  return data;
};

/**
 * Obtener productos por categoría
 */
export const getProductsByCategory = async (
  categoryId: number,
  page = 0,
  size = 20
): Promise<PageResponse<ProductResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  const { data } = await api.get(`/admin/products/by-category/${categoryId}?${params.toString()}`);
  return data;
};

/**
 * Obtener productos por marca
 */
export const getProductsByBrand = async (
  brandId: number,
  page = 0,
  size = 20
): Promise<PageResponse<ProductResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  const { data } = await api.get(`/admin/products/by-brand/${brandId}?${params.toString()}`);
  return data;
};

/**
 * Crear nuevo producto
 */
export const createProduct = async (request: CreateProductRequest): Promise<ProductResponse> => {
  const { data } = await api.post('/admin/products', request);
  return data;
};

/**
 * Actualizar producto existente
 */
export const updateProduct = async (
  id: number,
  request: UpdateProductRequest
): Promise<ProductResponse> => {
  const { data } = await api.put(`/admin/products/${id}`, request);
  return data;
};

/**
 * Eliminar producto (soft delete)
 */
export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/admin/products/${id}`);
};

/**
 * Alternar estado activo/inactivo
 */
export const toggleProductStatus = async (id: number): Promise<ProductResponse> => {
  const { data } = await api.put(`/admin/products/${id}/toggle-status`);
  return data;
};
