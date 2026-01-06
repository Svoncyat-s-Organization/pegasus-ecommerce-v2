import dayjs from 'dayjs';

/**
 * Descarga un archivo Blob con el nombre especificado
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Genera un nombre de archivo con timestamp
 */
const generateFilename = (prefix: string, extension: string): string => {
  const timestamp = dayjs().format('YYYY-MM-DD_HHmm');
  return `${prefix}_${timestamp}.${extension}`;
};

/**
 * Escapa caracteres especiales para CSV
 */
const escapeCSV = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Convierte un array de objetos a formato CSV
 */
const arrayToCSV = (
  headers: { key: string; label: string }[],
  data: Record<string, unknown>[]
): string => {
  const headerRow = headers.map((h) => escapeCSV(h.label)).join(',');
  const dataRows = data.map((row) =>
    headers.map((h) => escapeCSV(row[h.key] as string | number)).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
};

// ============================================
// Sales Report Export
// ============================================
export interface SalesExportData {
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalSales: number;
  averageTicket: number;
  details: Array<{
    date: string;
    orders: number;
    sales: number;
  }>;
}

export const exportSalesReportCSV = (data: SalesExportData) => {
  const headers = [
    { key: 'date', label: 'Fecha' },
    { key: 'orders', label: 'Pedidos' },
    { key: 'salesFormatted', label: 'Ventas (S/)' },
  ];

  const rows = data.details.map((row) => ({
    date: dayjs(row.date).format('DD/MM/YYYY'),
    orders: row.orders,
    salesFormatted: row.sales.toFixed(2),
  }));

  // Add summary row
  rows.push({
    date: 'TOTAL',
    orders: data.totalOrders,
    salesFormatted: data.totalSales.toFixed(2),
  });

  const csv = arrayToCSV(headers, rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, generateFilename('reporte_ventas', 'csv'));
};

// ============================================
// Invoice Report Export
// ============================================
export interface InvoiceExportData {
  startDate: string;
  endDate: string;
  totalInvoices: number;
  totalBills: number;
  totalTaxAmount: number;
  totalAmount: number;
  documents: Array<{
    id: number;
    type: string;
    series: string;
    number: string;
    issuedAt: string;
    receiverTaxId: string;
    receiverName: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
  }>;
}

export const exportInvoiceReportCSV = (data: InvoiceExportData) => {
  const headers = [
    { key: 'document', label: 'Documento' },
    { key: 'type', label: 'Tipo' },
    { key: 'issuedAt', label: 'Fecha Emisión' },
    { key: 'receiverTaxId', label: 'RUC/DNI' },
    { key: 'receiverName', label: 'Cliente' },
    { key: 'subtotal', label: 'Subtotal (S/)' },
    { key: 'taxAmount', label: 'IGV (S/)' },
    { key: 'totalAmount', label: 'Total (S/)' },
    { key: 'status', label: 'Estado' },
  ];

  const statusLabels: Record<string, string> = {
    ISSUED: 'Emitida',
    CANCELLED: 'Anulada',
    REJECTED: 'Rechazada',
  };

  const typeLabels: Record<string, string> = {
    INVOICE: 'Factura',
    BILL: 'Boleta',
  };

  const rows = data.documents.map((doc) => ({
    document: `${doc.series}-${doc.number}`,
    type: typeLabels[doc.type] || doc.type,
    issuedAt: dayjs(doc.issuedAt).format('DD/MM/YYYY HH:mm'),
    receiverTaxId: doc.receiverTaxId,
    receiverName: doc.receiverName,
    subtotal: doc.subtotal.toFixed(2),
    taxAmount: doc.taxAmount.toFixed(2),
    totalAmount: doc.totalAmount.toFixed(2),
    status: statusLabels[doc.status] || doc.status,
  }));

  const csv = arrayToCSV(headers, rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, generateFilename('reporte_facturacion', 'csv'));
};

// ============================================
// Purchase Report Export
// ============================================
export interface PurchaseExportData {
  startDate: string;
  endDate: string;
  totalPurchases: number;
  totalAmount: number;
  bySupplier: Array<{
    supplierId: number;
    supplierName: string;
    supplierDocNumber: string;
    purchaseCount: number;
    totalAmount: number;
  }>;
}

export const exportPurchaseReportCSV = (data: PurchaseExportData) => {
  const headers = [
    { key: 'supplierDocNumber', label: 'RUC/DNI' },
    { key: 'supplierName', label: 'Proveedor' },
    { key: 'purchaseCount', label: 'Compras' },
    { key: 'totalAmount', label: 'Monto Total (S/)' },
  ];

  const rows = data.bySupplier.map((row) => ({
    supplierDocNumber: row.supplierDocNumber,
    supplierName: row.supplierName,
    purchaseCount: row.purchaseCount,
    totalAmount: row.totalAmount.toFixed(2),
  }));

  // Add summary row
  rows.push({
    supplierDocNumber: '',
    supplierName: 'TOTAL',
    purchaseCount: data.totalPurchases,
    totalAmount: data.totalAmount.toFixed(2),
  });

  const csv = arrayToCSV(headers, rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, generateFilename('reporte_compras', 'csv'));
};

// ============================================
// Inventory Report Export
// ============================================
export interface InventoryExportData {
  reportDate: string;
  totalVariants: number;
  totalUnits: number;
  totalValue: number;
  byWarehouse: Array<{
    warehouseId: number;
    warehouseName: string;
    variantCount: number;
    units: number;
    value: number;
  }>;
}

export const exportInventoryReportCSV = (data: InventoryExportData) => {
  const headers = [
    { key: 'warehouseName', label: 'Almacén' },
    { key: 'variantCount', label: 'Variantes' },
    { key: 'units', label: 'Unidades' },
    { key: 'value', label: 'Valor (S/)' },
  ];

  const rows = data.byWarehouse.map((row) => ({
    warehouseName: row.warehouseName,
    variantCount: row.variantCount,
    units: row.units,
    value: row.value.toFixed(2),
  }));

  // Add summary row
  rows.push({
    warehouseName: 'TOTAL',
    variantCount: data.totalVariants,
    units: data.totalUnits,
    value: data.totalValue.toFixed(2),
  });

  const csv = arrayToCSV(headers, rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, generateFilename('reporte_inventario', 'csv'));
};

// ============================================
// Payment Report Export
// ============================================
export interface PaymentExportData {
  startDate: string;
  endDate: string;
  totalPayments: number;
  totalAmount: number;
  byPaymentMethod: Array<{
    paymentMethodId: number;
    paymentMethodName: string;
    count: number;
    amount: number;
  }>;
}

export const exportPaymentReportCSV = (data: PaymentExportData) => {
  const headers = [
    { key: 'paymentMethodName', label: 'Método de Pago' },
    { key: 'count', label: 'Cantidad' },
    { key: 'amount', label: 'Monto (S/)' },
  ];

  const rows = data.byPaymentMethod.map((row) => ({
    paymentMethodName: row.paymentMethodName,
    count: row.count,
    amount: row.amount.toFixed(2),
  }));

  // Add summary row
  rows.push({
    paymentMethodName: 'TOTAL',
    count: data.totalPayments,
    amount: data.totalAmount.toFixed(2),
  });

  const csv = arrayToCSV(headers, rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, generateFilename('reporte_pagos', 'csv'));
};
