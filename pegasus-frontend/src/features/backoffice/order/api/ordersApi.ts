import { api } from '@config/api';
import type {
  OrderResponse,
  OrderSummaryResponse,
  PageResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CreateShipmentForOrderRequest,
  Shipment,
  OrderStatus,
} from '@types';

/**
 * API para gestión de pedidos (Orders)
 */

/**
 * Obtener todos los pedidos con filtros opcionales
 */
export const getOrders = async (
  page: number,
  size: number,
  search?: string,
  status?: OrderStatus
): Promise<PageResponse<OrderSummaryResponse>> => {
  const params: Record<string, string | number> = { page, size };
  if (search) params.search = search;
  if (status) params.status = status;

  const { data } = await api.get('/admin/orders', { params });
  return data;
};

/**
 * Obtener detalle completo de un pedido por ID
 */
export const getOrderById = async (id: number): Promise<OrderResponse> => {
  const { data } = await api.get(`/admin/orders/${id}`);
  return data;
};

/**
 * Obtener pedido por número de orden
 */
export const getOrderByNumber = async (orderNumber: string): Promise<OrderResponse> => {
  const { data } = await api.get(`/admin/orders/by-number/${orderNumber}`);
  return data;
};

/**
 * Obtener pedidos de un cliente específico
 */
export const getOrdersByCustomer = async (
  customerId: number,
  page: number,
  size: number
): Promise<PageResponse<OrderSummaryResponse>> => {
  const { data } = await api.get(`/admin/orders/by-customer/${customerId}`, {
    params: { page, size },
  });
  return data;
};

/**
 * Crear un nuevo pedido manualmente desde el backoffice
 */
export const createOrder = async (request: CreateOrderRequest): Promise<OrderResponse> => {
  const { data } = await api.post('/admin/orders', request);
  return data;
};

/**
 * Actualizar el estado de un pedido
 */
export const updateOrderStatus = async (
  id: number,
  request: UpdateOrderStatusRequest
): Promise<OrderResponse> => {
  const { data } = await api.patch(`/admin/orders/${id}/status`, request);
  return data;
};

/**
 * Cancelar un pedido
 */
export const cancelOrder = async (
  id: number,
  reason?: string
): Promise<OrderResponse> => {
  const { data } = await api.patch(`/admin/orders/${id}/cancel`, null, {
    params: { reason },
  });
  return data;
};

/**
 * Crear envío para un pedido
 * Permite al backoffice crear envíos manualmente cuando los clientes tienen problemas
 */
export const createShipmentForOrder = async (
  orderId: number,
  request: CreateShipmentForOrderRequest
): Promise<Shipment> => {
  const { data } = await api.post(`/admin/orders/${orderId}/shipments`, request);
  return data;
};
