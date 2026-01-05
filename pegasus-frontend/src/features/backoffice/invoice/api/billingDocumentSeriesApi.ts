import { api } from '@config/api';
import type {
  CreateDocumentSeriesRequest,
  DocumentSeriesResponse,
  PageResponse,
  UpdateDocumentSeriesRequest,
} from '@types';

export const billingDocumentSeriesApi = {
  getAll: async (params: { page: number; size: number; search?: string }): Promise<PageResponse<DocumentSeriesResponse>> => {
    const { data } = await api.get<PageResponse<DocumentSeriesResponse>>('/admin/billing/document-series', {
      params,
    });
    return data;
  },

  getById: async (id: number): Promise<DocumentSeriesResponse> => {
    const { data } = await api.get<DocumentSeriesResponse>(`/admin/billing/document-series/${id}`);
    return data;
  },

  create: async (request: CreateDocumentSeriesRequest): Promise<DocumentSeriesResponse> => {
    const { data } = await api.post<DocumentSeriesResponse>('/admin/billing/document-series', request);
    return data;
  },

  update: async (id: number, request: UpdateDocumentSeriesRequest): Promise<DocumentSeriesResponse> => {
    const { data } = await api.put<DocumentSeriesResponse>(`/admin/billing/document-series/${id}`, request);
    return data;
  },

  toggle: async (id: number): Promise<DocumentSeriesResponse> => {
    const { data } = await api.patch<DocumentSeriesResponse>(`/admin/billing/document-series/${id}/toggle`);
    return data;
  },
};
