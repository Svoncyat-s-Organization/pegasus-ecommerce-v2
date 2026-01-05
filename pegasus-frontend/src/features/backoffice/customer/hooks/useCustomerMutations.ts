import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { customersApi } from '../api/customersApi';
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
} from '@types';

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getApiErrorMessage = (error: unknown): string | undefined =>
  (error as ApiErrorShape).response?.data?.message;

/**
 * Hook para crear un cliente
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => customersApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      message.success('Cliente creado exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al crear el cliente');
    },
  });
};

/**
 * Hook para actualizar un cliente
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerRequest }) =>
      customersApi.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
      message.success('Cliente actualizado exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al actualizar el cliente');
    },
  });
};

/**
 * Hook para eliminar un cliente (soft delete)
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      message.success('Cliente eliminado exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al eliminar el cliente');
    },
  });
};

/**
 * Hook para toggle del estado del cliente
 */
export const useToggleCustomerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customersApi.toggleCustomerStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      message.success('Estado del cliente actualizado');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al cambiar el estado');
    },
  });
};

// ==================== ADDRESS MUTATIONS ====================

/**
 * Hook para crear una dirección
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: number; data: CreateCustomerAddressRequest }) =>
      customersApi.createAddress(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses', variables.customerId] });
      message.success('Dirección agregada exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al agregar la dirección');
    },
  });
};

/**
 * Hook para actualizar una dirección
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      addressId,
      data,
    }: {
      customerId: number;
      addressId: number;
      data: UpdateCustomerAddressRequest;
    }) => customersApi.updateAddress(customerId, addressId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses', variables.customerId] });
      message.success('Dirección actualizada exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al actualizar la dirección');
    },
  });
};

/**
 * Hook para eliminar una dirección
 */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, addressId }: { customerId: number; addressId: number }) =>
      customersApi.deleteAddress(customerId, addressId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses', variables.customerId] });
      message.success('Dirección eliminada exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al eliminar la dirección');
    },
  });
};

/**
 * Hook para establecer dirección de envío por defecto
 */
export const useSetDefaultShipping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, addressId }: { customerId: number; addressId: number }) =>
      customersApi.setDefaultShipping(customerId, addressId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses', variables.customerId] });
      message.success('Dirección de envío actualizada');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al actualizar dirección de envío');
    },
  });
};

/**
 * Hook para establecer dirección de facturación por defecto
 */
export const useSetDefaultBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, addressId }: { customerId: number; addressId: number }) =>
      customersApi.setDefaultBilling(customerId, addressId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses', variables.customerId] });
      message.success('Dirección de facturación actualizada');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al actualizar dirección de facturación');
    },
  });
};
