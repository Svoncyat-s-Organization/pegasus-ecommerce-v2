import { api } from '@config/api';
import type { OrderSummaryResponse, PageResponse } from '@types';

export const adminOrdersApi = {
  getAll: async (params: {
    page: number;
    size: number;
    search?: string;
    status?: string;
  }): Promise<PageResponse<OrderSummaryResponse>> => {
    const { data } = await api.get<PageResponse<OrderSummaryResponse>>('/admin/orders', {
      params,
    });
    return data;
  },
};
