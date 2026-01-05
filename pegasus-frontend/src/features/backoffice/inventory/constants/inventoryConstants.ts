import type { OperationType } from '@types';

/**
 * Constants and labels for inventory module
 */

// Operation Type Labels (Spanish)
export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  INVENTORY_ADJUSTMENT: 'Ajuste de Inventario',
  PURCHASE: 'Compra',
  SALE: 'Venta',
  RETURN: 'Devolución',
  CANCELLATION: 'Cancelación',
  TRANSFER_IN: 'Transferencia Entrante',
  TRANSFER_OUT: 'Transferencia Saliente',
};

// Operation Type Colors (for Tags)
export const OPERATION_TYPE_COLORS: Record<OperationType, string> = {
  INVENTORY_ADJUSTMENT: 'purple',
  PURCHASE: 'green',
  SALE: 'blue',
  RETURN: 'orange',
  CANCELLATION: 'red',
  TRANSFER_IN: 'cyan',
  TRANSFER_OUT: 'magenta',
};

// Stock Status Thresholds
export const STOCK_THRESHOLDS = {
  LOW: 10,
  CRITICAL: 5,
  OUT_OF_STOCK: 0,
};

// Stock Status Colors
export const getStockStatusColor = (availableQuantity: number): string => {
  if (availableQuantity === 0) return 'red';
  if (availableQuantity <= STOCK_THRESHOLDS.CRITICAL) return 'orange';
  if (availableQuantity <= STOCK_THRESHOLDS.LOW) return 'gold';
  return 'green';
};

export const getStockStatusText = (availableQuantity: number): string => {
  if (availableQuantity === 0) return 'Sin Stock';
  if (availableQuantity <= STOCK_THRESHOLDS.CRITICAL) return 'Crítico';
  if (availableQuantity <= STOCK_THRESHOLDS.LOW) return 'Bajo';
  return 'Disponible';
};
