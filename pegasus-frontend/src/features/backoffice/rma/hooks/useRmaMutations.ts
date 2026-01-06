import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  createRma,
  approveOrRejectRma,
  markAsInTransit,
  markAsReceived,
  updateRma,
  inspectItem,
  completeInspection,
  processRefund,
  closeRma,
  cancelRma,
} from '../api/rmasApi';
import type { ApproveRmaRequest, InspectItemRequest, CreateRmaRequest, UpdateRmaRequest } from '@types';

type ErrorWithMessage = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) return fallback;
  const maybe = error as ErrorWithMessage;
  return maybe.response?.data?.message ?? fallback;
};

/**
 * Hook para mutaciones de RMAs
 */
export const useRmaMutations = () => {
  const queryClient = useQueryClient();

  // Mutation para crear RMA
  const createRmaMutation = useMutation({
    mutationFn: (request: CreateRmaRequest) => createRma(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      message.success('Devolución creada exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al crear la devolución'));
    },
  });

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
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al procesar la solicitud'));
    },
  });

  // Mutation para marcar como en tránsito
  const markInTransitMutation = useMutation({
    mutationFn: ({ rmaId, comments }: { rmaId: number; comments?: string }) =>
      markAsInTransit(rmaId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success('RMA marcado como en tránsito');
    },
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al marcar como en tránsito'));
    },
  });

  // Mutation para actualizar RMA (e.g. método de reembolso)
  const updateRmaMutation = useMutation({
    mutationFn: ({ rmaId, request }: { rmaId: number; request: UpdateRmaRequest }) =>
      updateRma(rmaId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rmas'] });
      queryClient.invalidateQueries({ queryKey: ['rma'] });
      message.success('RMA actualizado');
    },
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al actualizar RMA'));
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
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al marcar como recibido'));
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
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al inspeccionar item'));
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
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al completar inspección'));
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
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al procesar reembolso'));
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
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al cerrar RMA'));
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
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Error al cancelar RMA'));
    },
  });

  return {
    createRma: createRmaMutation.mutateAsync,
    approveReject: approveRejectMutation.mutateAsync,
    markInTransit: markInTransitMutation.mutateAsync,
    markReceived: markReceivedMutation.mutateAsync,
    updateRma: updateRmaMutation.mutateAsync,
    inspectItem: inspectItemMutation.mutateAsync,
    completeInspection: completeInspectionMutation.mutateAsync,
    processRefund: processRefundMutation.mutateAsync,
    closeRma: closeRmaMutation.mutateAsync,
    cancelRma: cancelRmaMutation.mutateAsync,
    isCreating: createRmaMutation.isPending,
    isApproving: approveRejectMutation.isPending,
    isMarkingInTransit: markInTransitMutation.isPending,
    isMarkingReceived: markReceivedMutation.isPending,
    isUpdating: updateRmaMutation.isPending,
    isInspecting: inspectItemMutation.isPending,
    isCompletingInspection: completeInspectionMutation.isPending,
    isProcessingRefund: processRefundMutation.isPending,
    isClosing: closeRmaMutation.isPending,
    isCancelling: cancelRmaMutation.isPending,
  };
};
