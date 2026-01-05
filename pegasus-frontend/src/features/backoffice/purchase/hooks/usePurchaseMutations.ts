import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { CreatePurchaseRequest, UpdatePurchaseStatusRequest } from '@types';
import { purchasesApi } from '../api/purchasesApi';

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePurchaseRequest) => purchasesApi.createPurchase(request),
    onSuccess: () => {
      message.success('Compra creada');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear compra');
    },
  });
};

export const useUpdatePurchaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number; request: UpdatePurchaseStatusRequest }) =>
      purchasesApi.updateStatus(params.id, params.request),
    onSuccess: () => {
      message.success('Estado de la compra actualizado');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchases', 'detail'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar estado');
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => purchasesApi.deletePurchase(id),
    onSuccess: () => {
      message.success('Compra eliminada');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar compra');
    },
  });
};
