export const SHIPMENT_STATUSES = {
  PENDING: 'Pendiente',
  IN_TRANSIT: 'En tránsito',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  RETURNED: 'Devuelto',
} as const;

export const SHIPMENT_TYPES = {
  OUTBOUND: 'Envío Saliente (Pedido)',
  INBOUND: 'Envío Entrante (Devolución/RMA)',
} as const;

export const TRACKING_EVENT_STATUSES = {
  PENDING: 'Pendiente',
  PICKED_UP: 'Recogido',
  IN_TRANSIT: 'En tránsito',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregado',
  FAILED_DELIVERY: 'Entrega fallida',
  RETURNED: 'Devuelto',
} as const;
