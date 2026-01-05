import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { adjustStock, transferStock } from '../api/stockApi';
import type { AdjustStockRequest, TransferStockRequest } from '@types';

/**
 * Hook for stock mutations (adjust and transfer)
 */
export const useStockMutations = () => {
  const queryClient = useQueryClient();

  const adjustMutation = useMutation({
    mutationFn: (request: AdjustStockRequest) => adjustStock(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      message.success('Stock ajustado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al ajustar stock');
    },
  });

  const transferMutation = useMutation({
    mutationFn: (request: TransferStockRequest) => transferStock(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      message.success('Transferencia realizada exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al transferir stock');
    },
  });

  return {
    adjustStock: adjustMutation.mutateAsync,
    transferStock: transferMutation.mutateAsync,
    isAdjusting: adjustMutation.isPending,
    isTransferring: transferMutation.isPending,
  };
};
