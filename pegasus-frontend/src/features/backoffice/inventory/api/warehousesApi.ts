import { api } from '@config/api';
import type {
  PageResponse,
  WarehouseResponse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '@types';

/**
 * API functions for warehouse management
 */

export const searchWarehouses = async (
  page: number,
  size: number,
  query?: string,
  isActive?: boolean
): Promise<PageResponse<WarehouseResponse>> => {
  const params: Record<string, unknown> = {
    page,
    size,
  };

  if (query) params.query = query;
  if (isActive !== undefined) params.isActive = isActive;

  const { data } = await api.get('/warehouses/search', { params });
  return data;
};

export const getActiveWarehouses = async (): Promise<WarehouseResponse[]> => {
  const { data } = await api.get('/warehouses/active');
  return data;
};

export const getWarehouseById = async (id: number): Promise<WarehouseResponse> => {
  const { data } = await api.get(`/warehouses/${id}`);
  return data;
};

export const getWarehouseByCode = async (code: string): Promise<WarehouseResponse> => {
  const { data } = await api.get(`/warehouses/code/${code}`);
  return data;
};

export const createWarehouse = async (
  request: CreateWarehouseRequest
): Promise<WarehouseResponse> => {
  const { data } = await api.post('/warehouses', request);
  return data;
};

export const updateWarehouse = async (
  id: number,
  request: UpdateWarehouseRequest
): Promise<WarehouseResponse> => {
  const { data } = await api.put(`/warehouses/${id}`, request);
  return data;
};

export const toggleWarehouseStatus = async (id: number): Promise<WarehouseResponse> => {
  const { data } = await api.patch(`/warehouses/${id}/toggle-status`);
  return data;
};

export const deleteWarehouse = async (id: number): Promise<void> => {
  await api.delete(`/warehouses/${id}`);
};
