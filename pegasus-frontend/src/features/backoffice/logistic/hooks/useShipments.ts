import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { CreateShipmentRequest, UpdateShipmentRequest } from '@types';
import {
  getShipments,
  getShipmentsByOrder,
  getShipmentById,
  getShipmentsByTrackingNumber,
  createShipment,
  updateShipment,
  deleteShipment,
} from '../api/shipmentsApi';

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getApiErrorMessage = (error: unknown): string | undefined =>
  (error as ApiErrorShape).response?.data?.message;

export const useShipments = (
  page: number,
  size: number,
  search?: string,
  status?: string,
  shipmentType?: string
) => {
  return useQuery({
    queryKey: ['shipments', page, size, search, status, shipmentType],
    queryFn: () => getShipments(page, size, search, status, shipmentType),
  });
};

export const useShipmentsByOrder = (orderId: number, page: number, size: number) => {
  return useQuery({
    queryKey: ['shipments-order', orderId, page, size],
    queryFn: () => getShipmentsByOrder(orderId, page, size),
    enabled: !!orderId,
  });
};

export const useShipmentById = (id: number) => {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: () => getShipmentById(id),
    enabled: !!id,
  });
};

export const useShipmentsByTrackingNumber = (trackingNumber: string) => {
  return useQuery({
    queryKey: ['shipments-tracking', trackingNumber],
    queryFn: () => getShipmentsByTrackingNumber(trackingNumber),
    enabled: !!trackingNumber && trackingNumber.length > 0,
  });
};

export const useCreateShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateShipmentRequest) => createShipment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      message.success('Envío creado exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al crear el envío');
    },
  });
};

export const useUpdateShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateShipmentRequest }) =>
      updateShipment(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
      message.success('Envío actualizado exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al actualizar el envío');
    },
  });
};

export const useDeleteShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteShipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      message.success('Envío eliminado exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al eliminar el envío');
    },
  });
};
