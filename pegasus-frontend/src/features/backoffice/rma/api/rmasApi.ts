import { api } from '@config/api';
import type {
  RmaResponse,
  RmaSummaryResponse,
  PageResponse,
  RmaStatus,
  ApproveRmaRequest,
  InspectItemRequest,
  RmaItemResponse,
  UpdateRmaRequest,
} from '@types';

/**
 * API para gestión de RMAs (Devoluciones)
 */

/**
 * Obtener todos los RMAs con filtros opcionales
 */
export const getRmas = async (
  page: number,
  size: number,
  search?: string,
  status?: RmaStatus,
  customerId?: number
): Promise<PageResponse<RmaSummaryResponse>> => {
  const params: Record<string, any> = { page, size };
  if (search) params.search = search;
  if (status) params.status = status;
  if (customerId) params.customerId = customerId;

  const { data } = await api.get('/admin/rmas', { params });
  return data;
};

/**
 * Obtener detalle completo de un RMA por ID
 */
export const getRmaById = async (id: number): Promise<RmaResponse> => {
  const { data } = await api.get(`/admin/rmas/${id}`);
  return data;
};

/**
 * Obtener RMA por número
 */
export const getRmaByNumber = async (rmaNumber: string): Promise<RmaResponse> => {
  const { data } = await api.get(`/admin/rmas/by-number/${rmaNumber}`);
  return data;
};

/**
 * Obtener RMAs de un cliente específico
 */
export const getRmasByCustomer = async (
  customerId: number,
  page: number,
  size: number
): Promise<PageResponse<RmaSummaryResponse>> => {
  const { data } = await api.get(`/admin/rmas/by-customer/${customerId}`, {
    params: { page, size },
  });
  return data;
};

/**
 * Obtener RMAs de una orden específica
 */
export const getRmasByOrder = async (
  orderId: number,
  page: number,
  size: number
): Promise<PageResponse<RmaSummaryResponse>> => {
  const { data } = await api.get(`/admin/rmas/by-order/${orderId}`, {
    params: { page, size },
  });
  return data;
};

/**
 * Actualizar información de un RMA
 */
export const updateRma = async (
  id: number,
  request: UpdateRmaRequest
): Promise<RmaResponse> => {
  const { data } = await api.put(`/admin/rmas/${id}`, request);
  return data;
};

/**
 * Cancelar un RMA
 */
export const cancelRma = async (
  id: number,
  comments?: string
): Promise<RmaResponse> => {
  const { data } = await api.delete(`/admin/rmas/${id}/cancel`, {
    params: { comments },
  });
  return data;
};

/**
 * Aprobar o rechazar un RMA
 */
export const approveOrRejectRma = async (
  id: number,
  request: ApproveRmaRequest
): Promise<RmaResponse> => {
  const { data } = await api.post(`/admin/rmas/${id}/approve`, request);
  return data;
};

/**
 * Marcar RMA como recibido en warehouse
 */
export const markAsReceived = async (
  id: number,
  comments?: string
): Promise<RmaResponse> => {
  const { data } = await api.post(`/admin/rmas/${id}/mark-received`, null, {
    params: { comments },
  });
  return data;
};

/**
 * Inspeccionar un item devuelto
 */
export const inspectItem = async (
  request: InspectItemRequest
): Promise<RmaItemResponse> => {
  const { data } = await api.post('/admin/rmas/items/inspect', request);
  return data;
};

/**
 * Obtener items sin inspeccionar de un RMA
 */
export const getUninspectedItems = async (
  rmaId: number
): Promise<RmaItemResponse[]> => {
  const { data } = await api.get(`/admin/rmas/${rmaId}/items/uninspected`);
  return data;
};

/**
 * Completar inspección de un RMA
 */
export const completeInspection = async (
  id: number,
  comments?: string
): Promise<RmaResponse> => {
  const { data } = await api.post(`/admin/rmas/${id}/complete-inspection`, null, {
    params: { comments },
  });
  return data;
};

/**
 * Procesar reembolso
 */
export const processRefund = async (
  id: number,
  comments?: string
): Promise<RmaResponse> => {
  const { data } = await api.post(`/admin/rmas/${id}/process-refund`, null, {
    params: { comments },
  });
  return data;
};

/**
 * Cerrar RMA (restock y finalizar)
 */
export const closeRma = async (
  id: number,
  warehouseId: number,
  comments?: string
): Promise<RmaResponse> => {
  const { data } = await api.post(`/admin/rmas/${id}/close`, null, {
    params: { warehouseId, comments },
  });
  return data;
};

/**
 * Obtener RMAs pendientes de inspección
 */
export const getRmasAwaitingInspection = async (
  page: number,
  size: number
): Promise<PageResponse<RmaSummaryResponse>> => {
  const { data } = await api.get('/admin/rmas/awaiting-inspection', {
    params: { page, size },
  });
  return data;
};

/**
 * Obtener RMAs listos para reembolso
 */
export const getRmasReadyForRefund = async (
  page: number,
  size: number
): Promise<PageResponse<RmaSummaryResponse>> => {
  const { data } = await api.get('/admin/rmas/ready-for-refund', {
    params: { page, size },
  });
  return data;
};
