import { api } from '@config/api';
import type { PageResponse, OrderResponse, OrderSummaryResponse } from '@types';

/**
 * Get authenticated customer orders
 * GET /api/storefront/orders
 */
export const getMyOrders = async (
  page = 0,
  size = 20
): Promise<PageResponse<OrderSummaryResponse>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: 'createdAt,desc',
  });
  const { data } = await api.get<PageResponse<OrderSummaryResponse>>(
    `/storefront/orders?${params}`
  );
  return data;
};

/**
 * Get order detail by ID
 * GET /api/storefront/orders/{id}
 */
export const getMyOrderById = async (id: number): Promise<OrderResponse> => {
  const { data } = await api.get<OrderResponse>(`/storefront/orders/${id}`);
  return data;
};

/**
 * Cancel my order
 * PATCH /api/storefront/orders/{id}/cancel
 */
export const cancelMyOrder = async (id: number, reason?: string): Promise<OrderResponse> => {
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  const { data } = await api.patch<OrderResponse>(`/storefront/orders/${id}/cancel${params}`);
  return data;
};
