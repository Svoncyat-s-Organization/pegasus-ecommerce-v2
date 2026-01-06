import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { advanceOrderStatus } from '../api/ordersApi';

/**
 * Hook para avanzar el estado del pedido
 */
export const useAdvanceOrderStatus = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      advanceOrderStatus(id, notes),
    onSuccess: () => {
      message.success('Estado del pedido avanzado exitosamente');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al avanzar el estado del pedido');
    },
  });
};
