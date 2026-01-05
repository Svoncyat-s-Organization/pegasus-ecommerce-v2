import { api } from '@config/api';
import type {
  CreateSupplierRequest,
  PageResponse,
  SupplierResponse,
  UpdateSupplierRequest,
} from '@types';

const BASE_URL = '/admin/purchases/suppliers';

export const suppliersApi = {
  getSuppliers: async (page = 0, size = 20, search?: string): Promise<PageResponse<SupplierResponse>> => {
    const { data } = await api.get<PageResponse<SupplierResponse>>(BASE_URL, {
      params: {
        page,
        size,
        ...(search && { search }),
      },
    });
    return data;
  },

  getSupplierById: async (id: number): Promise<SupplierResponse> => {
    const { data } = await api.get<SupplierResponse>(`${BASE_URL}/${id}`);
    return data;
  },

  createSupplier: async (request: CreateSupplierRequest): Promise<SupplierResponse> => {
    const { data } = await api.post<SupplierResponse>(BASE_URL, request);
    return data;
  },

  updateSupplier: async (id: number, request: UpdateSupplierRequest): Promise<SupplierResponse> => {
    const { data } = await api.put<SupplierResponse>(`${BASE_URL}/${id}`, request);
    return data;
  },

  toggleStatus: async (id: number): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/toggle-status`);
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
