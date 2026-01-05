import { api } from '@config/api';
import type {
  CreateInvoiceRequest,
  InvoiceResponse,
  InvoiceStatus,
  InvoiceSummaryResponse,
  PageResponse,
  UpdateInvoiceStatusRequest,
} from '@types';

export const billingInvoicesApi = {
  getAll: async (params: {
    page: number;
    size: number;
    search?: string;
    status?: InvoiceStatus;
  }): Promise<PageResponse<InvoiceSummaryResponse>> => {
    const { data } = await api.get<PageResponse<InvoiceSummaryResponse>>('/admin/billing/invoices', {
      params,
    });
    return data;
  },

  getById: async (id: number): Promise<InvoiceResponse> => {
    const { data } = await api.get<InvoiceResponse>(`/admin/billing/invoices/${id}`);
    return data;
  },

  getByOrderId: async (orderId: number): Promise<InvoiceResponse> => {
    const { data } = await api.get<InvoiceResponse>(`/admin/billing/invoices/by-order/${orderId}`);
    return data;
  },

  getBySeriesAndNumber: async (params: { series: string; number: string }): Promise<InvoiceResponse> => {
    const { data } = await api.get<InvoiceResponse>('/admin/billing/invoices/by-series-number', {
      params,
    });
    return data;
  },

  create: async (request: CreateInvoiceRequest): Promise<InvoiceResponse> => {
    const { data } = await api.post<InvoiceResponse>('/admin/billing/invoices', request);
    return data;
  },

  updateStatus: async (id: number, request: UpdateInvoiceStatusRequest): Promise<InvoiceResponse> => {
    const { data } = await api.patch<InvoiceResponse>(`/admin/billing/invoices/${id}/status`, request);
    return data;
  },
};
