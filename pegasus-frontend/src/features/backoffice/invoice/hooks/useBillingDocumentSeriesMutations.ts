import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { CreateDocumentSeriesRequest, UpdateDocumentSeriesRequest } from '@types';
import { billingDocumentSeriesApi } from '../api/billingDocumentSeriesApi';

export const useCreateBillingDocumentSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDocumentSeriesRequest) => billingDocumentSeriesApi.create(request),
    onSuccess: () => {
      message.success('Serie creada');
      queryClient.invalidateQueries({ queryKey: ['billing-document-series'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear serie');
    },
  });
};

export const useUpdateBillingDocumentSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number; request: UpdateDocumentSeriesRequest }) =>
      billingDocumentSeriesApi.update(params.id, params.request),
    onSuccess: () => {
      message.success('Serie actualizada');
      queryClient.invalidateQueries({ queryKey: ['billing-document-series'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar serie');
    },
  });
};

export const useToggleBillingDocumentSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => billingDocumentSeriesApi.toggle(id),
    onSuccess: () => {
      message.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: ['billing-document-series'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar estado');
    },
  });
};
