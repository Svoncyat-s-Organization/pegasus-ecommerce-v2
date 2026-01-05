import { api } from '@config/api';
import type { CreatePaymentRequest, PageResponse, PaymentResponse } from '@types';

export const billingPaymentsApi = {
  getAll: async (params: {
    page: number;
    size: number;
    search?: string;
    orderId?: number;
    paymentMethodId?: number;
  }): Promise<PageResponse<PaymentResponse>> => {
    const { data } = await api.get<PageResponse<PaymentResponse>>('/admin/billing/payments', { params });
    return data;
  },

  getById: async (id: number): Promise<PaymentResponse> => {
    const { data } = await api.get<PaymentResponse>(`/admin/billing/payments/${id}`);
    return data;
  },

  create: async (request: CreatePaymentRequest): Promise<PaymentResponse> => {
    const { data } = await api.post<PaymentResponse>('/admin/billing/payments', request);
    return data;
  },
};
