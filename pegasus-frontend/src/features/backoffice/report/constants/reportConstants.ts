/**
 * Tipos de reporte disponibles
 */
export const REPORT_TYPES = {
  SALES: 'sales',
  INVOICES: 'invoices',
  PURCHASES: 'purchases',
  INVENTORY: 'inventory',
  PAYMENTS: 'payments',
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

/**
 * Etiquetas de tipos de documento
 */
export const INVOICE_TYPE_LABELS: Record<string, string> = {
  INVOICE: 'Factura',
  BILL: 'Boleta',
};

/**
 * Etiquetas de estado de factura
 */
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  ISSUED: 'Emitida',
  CANCELLED: 'Anulada',
  REJECTED: 'Rechazada',
};

/**
 * Colores de estado de factura
 */
export const INVOICE_STATUS_COLORS: Record<string, string> = {
  ISSUED: 'green',
  CANCELLED: 'red',
  REJECTED: 'orange',
};

/**
 * Opciones de rango de fechas predefinidas
 */
export const DATE_RANGE_PRESETS = [
  { label: 'Hoy', days: 0 },
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Últimos 90 días', days: 90 },
  { label: 'Este año', days: 365 },
] as const;
