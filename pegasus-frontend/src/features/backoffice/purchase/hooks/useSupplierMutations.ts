import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { CreateSupplierRequest, UpdateSupplierRequest } from '@types';
import { suppliersApi } from '../api/suppliersApi';

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSupplierRequest) => suppliersApi.createSupplier(request),
    onSuccess: () => {
      message.success('Proveedor creado');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear proveedor');
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number; request: UpdateSupplierRequest }) =>
      suppliersApi.updateSupplier(params.id, params.request),
    onSuccess: () => {
      message.success('Proveedor actualizado');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'detail'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar proveedor');
    },
  });
};

export const useToggleSupplierStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.toggleStatus(id),
    onSuccess: () => {
      message.success('Estado del proveedor actualizado');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar estado');
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      message.success('Proveedor eliminado');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar proveedor');
    },
  });
};
