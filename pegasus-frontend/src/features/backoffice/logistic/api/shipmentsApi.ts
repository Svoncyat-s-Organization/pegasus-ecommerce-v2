import { api } from '@config/api';
import type {
  Shipment,
  CreateShipmentRequest,
  UpdateShipmentRequest,
  PageResponse,
} from '@types';

export const getShipments = async (
  page: number,
  size: number,
  search?: string,
  status?: string,
  shipmentType?: string
): Promise<PageResponse<Shipment>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (shipmentType) params.append('shipmentType', shipmentType);

  const { data } = await api.get(`/admin/shipments?${params}`);
  return data;
};

export const getShipmentsByOrder = async (
  orderId: number,
  page: number,
  size: number
): Promise<PageResponse<Shipment>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const { data } = await api.get(`/admin/shipments/order/${orderId}?${params}`);
  return data;
};

export const getShipmentById = async (id: number): Promise<Shipment> => {
  const { data } = await api.get(`/admin/shipments/${id}`);
  return data;
};

export const getShipmentsByTrackingNumber = async (
  trackingNumber: string
): Promise<Shipment[]> => {
  const { data } = await api.get(`/admin/shipments/tracking/${trackingNumber}`);
  return data;
};

export const createShipment = async (request: CreateShipmentRequest): Promise<Shipment> => {
  const { data } = await api.post('/admin/shipments', request);
  return data;
};

export const updateShipment = async (
  id: number,
  request: UpdateShipmentRequest
): Promise<Shipment> => {
  const { data } = await api.put(`/admin/shipments/${id}`, request);
  return data;
};

export const deleteShipment = async (id: number): Promise<void> => {
  await api.delete(`/admin/shipments/${id}`);
};
