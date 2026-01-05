import type { PurchaseStatus } from '@types';

export const PURCHASE_STATUS: Record<PurchaseStatus, { text: string; color: string }> = {
  PENDING: { text: 'Pendiente', color: 'gold' },
  RECEIVED: { text: 'Recibida', color: 'green' },
  CANCELLED: { text: 'Cancelada', color: 'red' },
};

export const SUPPLIER_STATUS = {
  ACTIVE: { text: 'Activo', color: 'green' },
  INACTIVE: { text: 'Inactivo', color: 'red' },
} as const;
