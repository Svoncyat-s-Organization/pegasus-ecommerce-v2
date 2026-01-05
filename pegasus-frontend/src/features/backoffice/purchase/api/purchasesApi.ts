import { api } from '@config/api';
import type {
  CreatePurchaseRequest,
  PageResponse,
  PurchaseResponse,
  UpdatePurchaseStatusRequest,
} from '@types';

const BASE_URL = '/admin/purchases';

export const purchasesApi = {
  getPurchases: async (page = 0, size = 20, search?: string): Promise<PageResponse<PurchaseResponse>> => {
    const { data } = await api.get<PageResponse<PurchaseResponse>>(BASE_URL, {
      params: {
        page,
        size,
        ...(search && { search }),
      },
    });
    return data;
  },

  getPurchaseById: async (id: number): Promise<PurchaseResponse> => {
    const { data } = await api.get<PurchaseResponse>(`${BASE_URL}/${id}`);
    return data;
  },

  createPurchase: async (request: CreatePurchaseRequest): Promise<PurchaseResponse> => {
    const { data } = await api.post<PurchaseResponse>(BASE_URL, request);
    return data;
  },

  updateStatus: async (id: number, request: UpdatePurchaseStatusRequest): Promise<PurchaseResponse> => {
    const { data } = await api.patch<PurchaseResponse>(`${BASE_URL}/${id}/status`, request);
    return data;
  },

  deletePurchase: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
