import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  approveOrRejectRma,
  markAsReceived,
  inspectItem,
  completeInspection,
  processRefund,
  closeRma,
  cancelRma,
} from '../api/rmasApi';
import type { ApproveRmaRequest, InspectItemRequest } from '@types';

/**
 * Hook para mutaciones de RMAs
 */
export const useRmaMutations = () => {
  const queryClient = useQueryClient();

  // Mutation para aprobar/rechazar
  const approveRejectMutation = useMutation({
    mutationFn: ({ rmaId, request }: { rmaId: number; request: ApproveRmaRequest }) =>
      approveOrRejectRma(rmaId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success(
        variables.request.approved 
          ? 'RMA aprobado exitosamente' 
          : 'RMA rechazado exitosamente'
      );
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al procesar la solicitud');
    },
  });

  // Mutation para marcar como recibido
  const markReceivedMutation = useMutation({
    mutationFn: ({ rmaId, comments }: { rmaId: number; comments?: string }) =>
      markAsReceived(rmaId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success('RMA marcado como recibido exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al marcar como recibido');
    },
  });

  // Mutation para inspeccionar item
  const inspectItemMutation = useMutation({
    mutationFn: (request: InspectItemRequest) => inspectItem(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success('Item inspeccionado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al inspeccionar item');
    },
  });

  // Mutation para completar inspección
  const completeInspectionMutation = useMutation({
    mutationFn: ({ rmaId, comments }: { rmaId: number; comments?: string }) =>
      completeInspection(rmaId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success('Inspección completada exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al completar inspección');
    },
  });

  // Mutation para procesar reembolso
  const processRefundMutation = useMutation({
    mutationFn: ({ rmaId, comments }: { rmaId: number; comments?: string }) =>
      processRefund(rmaId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success('Reembolso procesado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al procesar reembolso');
    },
  });

  // Mutation para cerrar RMA
  const closeRmaMutation = useMutation({
    mutationFn: ({ 
      rmaId, 
      warehouseId, 
      comments 
    }: { 
      rmaId: number; 
      warehouseId: number; 
      comments?: string 
    }) => closeRma(rmaId, warehouseId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success('RMA cerrado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al cerrar RMA');
    },
  });

  // Mutation para cancelar RMA
  const cancelRmaMutation = useMutation({
    mutationFn: ({ rmaId, comments }: { rmaId: number; comments?: string }) =>
      cancelRma(rmaId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success('RMA cancelado exitosamente');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Error al cancelar RMA');
    },
  });

  return {
    approveReject: approveRejectMutation.mutateAsync,
    markReceived: markReceivedMutation.mutateAsync,
    inspectItem: inspectItemMutation.mutateAsync,
    completeInspection: completeInspectionMutation.mutateAsync,
    processRefund: processRefundMutation.mutateAsync,
    closeRma: closeRmaMutation.mutateAsync,
    cancelRma: cancelRmaMutation.mutateAsync,
    isApproving: approveRejectMutation.isPending,
    isMarkingReceived: markReceivedMutation.isPending,
    isInspecting: inspectItemMutation.isPending,
    isCompletingInspection: completeInspectionMutation.isPending,
    isProcessingRefund: processRefundMutation.isPending,
    isClosing: closeRmaMutation.isPending,
    isCancelling: cancelRmaMutation.isPending,
  };
};
