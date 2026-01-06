import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { advanceOrderStatus } from '../api/ordersApi';

/**
 * Hook para avanzar el estado del pedido
 */
export const useAdvanceOrderStatus = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      advanceOrderStatus(id, notes),
    onSuccess: async (_, variables) => {
      // Invalidar la query del pedido específico para refrescar el historial
      await queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      // Invalidar la lista de pedidos para refrescar la tabla
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      message.success('Estado del pedido avanzado exitosamente');
      onSuccess?.();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al avanzar el estado del pedido');
    },
  });
};
