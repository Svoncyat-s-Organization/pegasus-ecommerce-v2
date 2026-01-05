import { api } from '@config/api';
import type { CreateOrderRequest, CreateOrderResponse } from '../types/checkout.types';
import type { ShippingMethodResponse } from '@types';

/**
 * Create a new order (Storefront - requires CUSTOMER auth)
 */
export const createOrder = async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
  const { data } = await api.post('/storefront/orders', request);
  return data;
};

/**
 * Get available shipping methods (Public - no auth required)
 */
export const getShippingMethods = async (): Promise<ShippingMethodResponse[]> => {
  const { data } = await api.get('/public/shipping-methods');
  return data;
};
