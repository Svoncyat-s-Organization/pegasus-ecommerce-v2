import type { RmaStatus, RmaReason, ItemCondition, RefundMethod } from '@types';

/**
 * Labels en español para los estados de RMA
 */
export const RMA_STATUS_LABELS: Record<RmaStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  IN_TRANSIT: 'En Tránsito',
  RECEIVED: 'Recibido',
  INSPECTING: 'En Inspección',
  REFUNDED: 'Reembolsado',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
};

/**
 * Colores de tags para estados de RMA (Ant Design)
 */
export const RMA_STATUS_COLORS: Record<RmaStatus, string> = {
  PENDING: 'default',
  APPROVED: 'cyan',
  REJECTED: 'error',
  IN_TRANSIT: 'processing',
  RECEIVED: 'blue',
  INSPECTING: 'orange',
  REFUNDED: 'purple',
  CLOSED: 'success',
  CANCELLED: 'default',
};

/**
 * Labels en español para motivos de devolución
 */
export const RMA_REASON_LABELS: Record<RmaReason, string> = {
  DEFECTIVE: 'Producto Defectuoso',
  WRONG_ITEM: 'Producto Incorrecto',
  NOT_AS_DESCRIBED: 'No Coincide con Descripción',
  DAMAGED_SHIPPING: 'Dañado en Envío',
  CHANGED_MIND: 'Cambió de Opinión',
  SIZE_COLOR: 'Talla/Color Incorrecto',
  LATE_DELIVERY: 'Entrega Tardía',
  OTHER: 'Otro Motivo',
};

/**
 * Labels en español para condiciones de items
 */
export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  UNOPENED: 'Sin Abrir',
  OPENED_UNUSED: 'Abierto sin Usar',
  USED_LIKE_NEW: 'Usado como Nuevo',
  USED_GOOD: 'Usado en Buen Estado',
  DAMAGED: 'Dañado',
  DEFECTIVE: 'Defectuoso',
};

/**
 * Colores para condiciones de items
 */
export const ITEM_CONDITION_COLORS: Record<ItemCondition, string> = {
  UNOPENED: 'success',
  OPENED_UNUSED: 'cyan',
  USED_LIKE_NEW: 'blue',
  USED_GOOD: 'orange',
  DAMAGED: 'error',
  DEFECTIVE: 'error',
};

/**
 * Labels en español para métodos de reembolso
 */
export const REFUND_METHOD_LABELS: Record<RefundMethod, string> = {
  ORIGINAL_PAYMENT: 'Método de Pago Original',
  BANK_TRANSFER: 'Transferencia Bancaria',
  STORE_CREDIT: 'Crédito en Tienda',
  EXCHANGE: 'Cambio por Otro Producto',
};

/**
 * Acciones disponibles por estado
 */
export const RMA_ACTIONS_BY_STATUS: Record<RmaStatus, string[]> = {
  PENDING: ['approve', 'reject', 'cancel'],
  APPROVED: ['mark-received', 'cancel'],
  REJECTED: [],
  IN_TRANSIT: ['mark-received'],
  RECEIVED: ['inspect-items', 'cancel'],
  INSPECTING: ['complete-inspection'],
  REFUNDED: ['close'],
  CLOSED: [],
  CANCELLED: [],
};

/**
 * Verifica si una acción está disponible para un estado
 */
export const isActionAvailable = (status: RmaStatus, action: string): boolean => {
  return RMA_ACTIONS_BY_STATUS[status].includes(action);
};
