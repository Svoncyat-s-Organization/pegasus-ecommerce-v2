import type { InvoiceStatus, InvoiceType } from '@types';

export const INVOICE_TYPE_LABEL: Record<InvoiceType, string> = {
  BILL: 'Boleta',
  INVOICE: 'Factura',
  CREDIT_NOTE: 'Nota de crédito',
};

export const INVOICE_STATUS_META: Record<InvoiceStatus, { text: string; color: string }> = {
  ISSUED: { text: 'Emitido', color: 'green' },
  CANCELLED: { text: 'Anulado', color: 'red' },
  REJECTED: { text: 'Rechazado', color: 'orange' },
};
