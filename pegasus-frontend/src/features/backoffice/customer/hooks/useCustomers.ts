import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import type { CustomerResponse } from '@types';

/**
 * Hook para obtener lista de clientes con paginación
 */
export const useCustomers = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['customers', page, size],
    queryFn: () => customersApi.getCustomers(page, size),
  });
};

/**
 * Hook para obtener un cliente por ID
 */
export const useCustomer = (
  id: number,
  options?: Omit<UseQueryOptions<CustomerResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getCustomerById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook para obtener direcciones de un cliente
 */
export const useCustomerAddresses = (customerId: number) => {
  return useQuery({
    queryKey: ['customer-addresses', customerId],
    queryFn: () => customersApi.getCustomerAddresses(customerId),
    enabled: !!customerId,
  });
};
