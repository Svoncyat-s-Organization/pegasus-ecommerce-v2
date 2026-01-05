import { api } from '@config/api';
import type { PageResponse, MovementResponse, OperationType } from '@types';

/**
 * API functions for inventory movements (Kardex)
 */

export const searchMovements = async (
  page: number,
  size: number,
  warehouseId?: number,
  variantId?: number,
  operationType?: OperationType,
  fromDate?: string,
  toDate?: string
): Promise<PageResponse<MovementResponse>> => {
  const params: Record<string, unknown> = {
    page,
    size,
  };

  if (warehouseId) params.warehouseId = warehouseId;
  if (variantId) params.variantId = variantId;
  if (operationType) params.operationType = operationType;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  const { data } = await api.get('/movements/search', { params });
  return data;
};

export const getMovementsByVariant = async (
  variantId: number,
  page: number,
  size: number
): Promise<PageResponse<MovementResponse>> => {
  const { data } = await api.get(`/movements/variant/${variantId}`, {
    params: { page, size },
  });
  return data;
};

export const getMovementsByWarehouse = async (
  warehouseId: number,
  page: number,
  size: number
): Promise<PageResponse<MovementResponse>> => {
  const { data } = await api.get(`/movements/warehouse/${warehouseId}`, {
    params: { page, size },
  });
  return data;
};

export const getMovementsByReference = async (
  referenceId: number,
  referenceTable: string,
  page: number,
  size: number
): Promise<PageResponse<MovementResponse>> => {
  const { data } = await api.get('/movements/reference', {
    params: { referenceId, referenceTable, page, size },
  });
  return data;
};
