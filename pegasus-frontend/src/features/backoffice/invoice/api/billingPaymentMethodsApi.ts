import { api } from '@config/api';
import type {
  CreatePaymentMethodRequest,
  PageResponse,
  PaymentMethodResponse,
  UpdatePaymentMethodRequest,
} from '@types';

export const billingPaymentMethodsApi = {
  getAll: async (params: { page: number; size: number; search?: string }): Promise<PageResponse<PaymentMethodResponse>> => {
    const { data } = await api.get<PageResponse<PaymentMethodResponse>>('/admin/billing/payment-methods', {
      params,
    });
    return data;
  },

  getById: async (id: number): Promise<PaymentMethodResponse> => {
    const { data } = await api.get<PaymentMethodResponse>(`/admin/billing/payment-methods/${id}`);
    return data;
  },

  create: async (request: CreatePaymentMethodRequest): Promise<PaymentMethodResponse> => {
    const { data } = await api.post<PaymentMethodResponse>('/admin/billing/payment-methods', request);
    return data;
  },

  update: async (id: number, request: UpdatePaymentMethodRequest): Promise<PaymentMethodResponse> => {
    const { data } = await api.put<PaymentMethodResponse>(`/admin/billing/payment-methods/${id}`, request);
    return data;
  },

  toggle: async (id: number): Promise<PaymentMethodResponse> => {
    const { data } = await api.patch<PaymentMethodResponse>(`/admin/billing/payment-methods/${id}/toggle`);
    return data;
  },
};
