import { useQuery } from '@tanstack/react-query';
import {
  getSalesReport,
  getInvoiceReport,
  getPurchaseReport,
  getInventoryReport,
  getPaymentReport,
} from '../api/reportApi';

/**
 * Hook para obtener el reporte de ventas
 */
export const useSalesReport = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: ['reports', 'sales', startDate, endDate],
    queryFn: () => getSalesReport(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener el reporte de facturación
 */
export const useInvoiceReport = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: ['reports', 'invoices', startDate, endDate],
    queryFn: () => getInvoiceReport(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener el reporte de compras
 */
export const usePurchaseReport = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: ['reports', 'purchases', startDate, endDate],
    queryFn: () => getPurchaseReport(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener el reporte de inventario
 */
export const useInventoryReport = (enabled = true) => {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: getInventoryReport,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener el reporte de pagos
 */
export const usePaymentReport = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: ['reports', 'payments', startDate, endDate],
    queryFn: () => getPaymentReport(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  });
};
