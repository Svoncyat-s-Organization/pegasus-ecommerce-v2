import type { OrderStatus } from '@types';

/**
 * Labels en español para los estados de pedidos
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  AWAIT_PAYMENT: 'Esperando Pago',
  PAID: 'Pagado',
  PROCESSING: 'En Proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

/**
 * Colores de tags para estados de pedidos (Ant Design)
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'default',
  AWAIT_PAYMENT: 'warning',
  PAID: 'cyan',
  PROCESSING: 'processing',
  SHIPPED: 'blue',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'purple',
};

/**
 * Transiciones de estado permitidas
 * Define qué estados pueden cambiar a qué otros estados
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['AWAIT_PAYMENT', 'CANCELLED'],
  AWAIT_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

/**
 * Verifica si una transición de estado es válida
 */
export const isValidStatusTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean => {
  return ORDER_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
};

/**
 * Obtiene los estados disponibles para transición desde el estado actual
 */
export const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  return ORDER_STATUS_TRANSITIONS[currentStatus];
};
