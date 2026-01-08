import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, getMyOrderById, cancelMyOrder, confirmOrderDelivered } from '../api/ordersApi';

/**
 * Hook to fetch authenticated customer orders
 */
export const useMyOrders = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['storefront', 'orders', page, size],
    queryFn: () => getMyOrders(page, size),
  });
};

/**
 * Hook to fetch order detail
 */
export const useMyOrderDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['storefront', 'orders', id],
    queryFn: () => (id ? getMyOrderById(id) : Promise.reject('No order ID')),
    enabled: !!id,
  });
};

/**
 * Hook to cancel order
 */
export const useCancelMyOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => cancelMyOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', 'orders'] });
    },
  });
};

/**
 * Hook to confirm order delivered
 */
export const useConfirmOrderDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confirmOrderDelivered(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', 'orders'] });
    },
  });
};
