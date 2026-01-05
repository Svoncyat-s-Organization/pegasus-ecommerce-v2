import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { CreateTrackingEventRequest } from '@types';
import {
  getTrackingEventsByShipment,
  getPublicTrackingEventsByShipment,
  getTrackingEventById,
  createTrackingEvent,
  deleteTrackingEvent,
} from '../api/trackingEventsApi';

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getApiErrorMessage = (error: unknown): string | undefined =>
  (error as ApiErrorShape).response?.data?.message;

export const useTrackingEventsByShipment = (
  shipmentId: number,
  page: number,
  size: number,
  search?: string
) => {
  return useQuery({
    queryKey: ['tracking-events', shipmentId, page, size, search],
    queryFn: () => getTrackingEventsByShipment(shipmentId, page, size, search),
    enabled: !!shipmentId,
  });
};

export const usePublicTrackingEventsByShipment = (shipmentId: number) => {
  return useQuery({
    queryKey: ['tracking-events-public', shipmentId],
    queryFn: () => getPublicTrackingEventsByShipment(shipmentId),
    enabled: !!shipmentId,
  });
};

// Alias for convenience (returns all events, not paginated)
export const useTrackingEvents = usePublicTrackingEventsByShipment;

export const useTrackingEventById = (id: number) => {
  return useQuery({
    queryKey: ['tracking-event', id],
    queryFn: () => getTrackingEventById(id),
    enabled: !!id,
  });
};

export const useCreateTrackingEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTrackingEventRequest) => createTrackingEvent(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-events', variables.shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['tracking-events-public', variables.shipmentId] });
      message.success('Evento de tracking creado exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al crear el evento de tracking');
    },
  });
};

export const useDeleteTrackingEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTrackingEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-events'] });
      message.success('Evento de tracking eliminado exitosamente');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error) || 'Error al eliminar el evento de tracking');
    },
  });
};
