import { useMutation } from '@tanstack/react-query';
import { createOrder } from '../api/checkoutApi';
import type { CreateOrderRequest } from '../types/checkout.types';

/**
 * Hook to create a new order
 */
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (request: CreateOrderRequest) => createOrder(request),
  });
};
