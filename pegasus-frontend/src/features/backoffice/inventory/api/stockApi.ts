import { api } from '@config/api';
import type {
  PageResponse,
  StockResponse,
  StockSummaryResponse,
  StockAvailabilityResponse,
  AdjustStockRequest,
  TransferStockRequest,
} from '@types';

/**
 * API functions for stock management
 */

export const getStockByWarehouse = async (
  warehouseId: number,
  page: number,
  size: number
): Promise<PageResponse<StockResponse>> => {
  const { data } = await api.get(`/stock/warehouse/${warehouseId}`, {
    params: { page, size },
  });
  return data;
};

export const getStockByVariant = async (
  variantId: number
): Promise<StockSummaryResponse[]> => {
  const { data } = await api.get(`/stock/variant/${variantId}`);
  return data;
};

export const getStockByWarehouseAndVariant = async (
  warehouseId: number,
  variantId: number
): Promise<StockResponse> => {
  const { data } = await api.get(`/stock/warehouse/${warehouseId}/variant/${variantId}`);
  return data;
};

export const checkStockAvailability = async (
  warehouseId: number,
  variantId: number,
  quantity: number
): Promise<StockAvailabilityResponse> => {
  const { data } = await api.get('/stock/availability', {
    params: { warehouseId, variantId, quantity },
  });
  return data;
};

export const getLowStockByWarehouse = async (
  warehouseId: number,
  threshold: number = 10
): Promise<StockSummaryResponse[]> => {
  const { data } = await api.get(`/stock/warehouse/${warehouseId}/low-stock`, {
    params: { threshold },
  });
  return data;
};

export const adjustStock = async (request: AdjustStockRequest): Promise<StockResponse> => {
  const { data } = await api.post('/stock/adjust', request);
  return data;
};

export const transferStock = async (request: TransferStockRequest): Promise<void> => {
  await api.post('/stock/transfer', request);
};
