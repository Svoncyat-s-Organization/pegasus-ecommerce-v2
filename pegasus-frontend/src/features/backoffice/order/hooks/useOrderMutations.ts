import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { updateOrderStatus, cancelOrder, createShipmentForOrder, createOrder } from '../api/ordersApi';
import type { UpdateOrderStatusRequest, CreateShipmentForOrderRequest, CreateOrderRequest } from '@types';

/**
 * Hook para mutaciones de pedidos (actualizar estado, cancelar, crear envíos)
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
    onError: (error: { response?: { data?: { message?: string } } }) => {
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
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Error al cancelar el pedido');
    },
  });

  // Mutation para crear envío desde un pedido
  const createShipmentMutation = useMutation({
    mutationFn: ({ orderId, request }: { orderId: number; request: CreateShipmentForOrderRequest }) =>
      createShipmentForOrder(orderId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipments-order'] });
      // No mostrar mensaje aquí, lo maneja el componente
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Error al crear el envío');
    },
  });

  // Mutation para crear pedido
  const createOrderMutation = useMutation({
    mutationFn: (request: CreateOrderRequest) => createOrder(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      message.success('Pedido creado exitosamente');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Error al crear el pedido');
    },
  });

  return {
    updateStatus: updateStatusMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    createShipment: createShipmentMutation.mutateAsync,
    createOrder: createOrderMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
    isCreatingShipment: createShipmentMutation.isPending,
    isCreatingOrder: createOrderMutation.isPending,
  };
};
