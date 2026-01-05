import { api } from '@config/api';
import type {
  ShippingMethod,
  CreateShippingMethodRequest,
  UpdateShippingMethodRequest,
  PageResponse,
} from '@types';

export const getShippingMethods = async (
  page: number,
  size: number,
  search?: string,
  isActive?: boolean
): Promise<PageResponse<ShippingMethod>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search) params.append('search', search);
  if (isActive !== undefined) params.append('isActive', isActive.toString());

  const { data } = await api.get(`/admin/shipping-methods?${params}`);
  return data;
};

export const getShippingMethodById = async (id: number): Promise<ShippingMethod> => {
  const { data } = await api.get(`/admin/shipping-methods/${id}`);
  return data;
};

export const createShippingMethod = async (
  request: CreateShippingMethodRequest
): Promise<ShippingMethod> => {
  const { data } = await api.post('/admin/shipping-methods', request);
  return data;
};

export const updateShippingMethod = async (
  id: number,
  request: UpdateShippingMethodRequest
): Promise<ShippingMethod> => {
  const { data } = await api.put(`/admin/shipping-methods/${id}`, request);
  return data;
};

export const deleteShippingMethod = async (id: number): Promise<void> => {
  await api.delete(`/admin/shipping-methods/${id}`);
};
