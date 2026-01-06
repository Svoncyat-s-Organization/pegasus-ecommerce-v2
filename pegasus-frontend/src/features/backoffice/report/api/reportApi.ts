import { api } from '@config/api';
import type {
  SalesReportResponse,
  InvoiceReportResponse,
  PurchaseReportResponse,
  InventoryReportResponse,
  PaymentReportResponse,
} from '@types';

/**
 * Obtiene el reporte de ventas por período
 */
export const getSalesReport = async (
  startDate: string,
  endDate: string
): Promise<SalesReportResponse> => {
  const { data } = await api.get('/admin/reports/sales', {
    params: { startDate, endDate },
  });
  return data;
};

/**
 * Obtiene el reporte de facturación
 */
export const getInvoiceReport = async (
  startDate: string,
  endDate: string
): Promise<InvoiceReportResponse> => {
  const { data } = await api.get('/admin/reports/invoices', {
    params: { startDate, endDate },
  });
  return data;
};

/**
 * Obtiene el reporte de compras por proveedor
 */
export const getPurchaseReport = async (
  startDate: string,
  endDate: string
): Promise<PurchaseReportResponse> => {
  const { data } = await api.get('/admin/reports/purchases', {
    params: { startDate, endDate },
  });
  return data;
};

/**
 * Obtiene el reporte de inventario valorizado
 */
export const getInventoryReport = async (): Promise<InventoryReportResponse> => {
  const { data } = await api.get('/admin/reports/inventory');
  return data;
};

/**
 * Obtiene el reporte de pagos recibidos
 */
export const getPaymentReport = async (
  startDate: string,
  endDate: string
): Promise<PaymentReportResponse> => {
  const { data } = await api.get('/admin/reports/payments', {
    params: { startDate, endDate },
  });
  return data;
};
