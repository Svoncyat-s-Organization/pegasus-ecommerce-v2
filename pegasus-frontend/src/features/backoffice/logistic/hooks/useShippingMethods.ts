import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  CreateShippingMethodRequest,
  UpdateShippingMethodRequest,
} from '@types';
import {
  getShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} from '../api/shippingMethodsApi';

export const useShippingMethods = (
  page: number,
  size: number,
  search?: string,
  isActive?: boolean
) => {
  return useQuery({
    queryKey: ['shipping-methods', page, size, search, isActive],
    queryFn: () => getShippingMethods(page, size, search, isActive),
  });
};

export const useShippingMethodById = (id: number) => {
  return useQuery({
    queryKey: ['shipping-method', id],
    queryFn: () => getShippingMethodById(id),
    enabled: !!id,
  });
};

export const useCreateShippingMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateShippingMethodRequest) => createShippingMethod(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] });
      message.success('Método de envío creado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al crear el método de envío');
    },
  });
};

export const useUpdateShippingMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateShippingMethodRequest }) =>
      updateShippingMethod(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] });
      queryClient.invalidateQueries({ queryKey: ['shipping-method', variables.id] });
      message.success('Método de envío actualizado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al actualizar el método de envío');
    },
  });
};

export const useDeleteShippingMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteShippingMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods'] });
      message.success('Método de envío eliminado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al eliminar el método de envío');
    },
  });
};
