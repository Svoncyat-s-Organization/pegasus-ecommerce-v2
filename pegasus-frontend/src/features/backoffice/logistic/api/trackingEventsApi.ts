import { api } from '@config/api';
import type { TrackingEvent, CreateTrackingEventRequest, PageResponse } from '@types';

export const getTrackingEventsByShipment = async (
  shipmentId: number,
  page: number,
  size: number,
  search?: string
): Promise<PageResponse<TrackingEvent>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search) params.append('search', search);

  const { data } = await api.get(`/admin/tracking-events/shipment/${shipmentId}?${params}`);
  return data;
};

export const getPublicTrackingEventsByShipment = async (
  shipmentId: number
): Promise<TrackingEvent[]> => {
  const { data } = await api.get(`/admin/tracking-events/shipment/${shipmentId}/public`);
  return data;
};

export const getTrackingEventById = async (id: number): Promise<TrackingEvent> => {
  const { data } = await api.get(`/admin/tracking-events/${id}`);
  return data;
};

export const createTrackingEvent = async (
  request: CreateTrackingEventRequest
): Promise<TrackingEvent> => {
  const { data } = await api.post('/admin/tracking-events', request);
  return data;
};

export const deleteTrackingEvent = async (id: number): Promise<void> => {
  await api.delete(`/admin/tracking-events/${id}`);
};
