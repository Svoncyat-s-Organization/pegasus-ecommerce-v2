import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { updateOrderStatus, cancelOrder } from '../api/ordersApi';
import type { UpdateOrderStatusRequest } from '@types';

/**
 * Hook para mutaciones de pedidos (actualizar estado, cancelar)
 */
export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  // Mutation para actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, request }: { orderId: number; request: UpdateOrderStatusRequest }) =>
      updateOrderStatus(orderId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      message.success('Estado del pedido actualizado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al actualizar el estado del pedido');
    },
  });

  // Mutation para cancelar pedido
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason?: string }) =>
      cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      message.success('Pedido cancelado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al cancelar el pedido');
    },
  });

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
  };
};
