import { useQuery } from '@tanstack/react-query';
import type { InvoiceStatus } from '@types';
import { billingInvoicesApi } from '../api/billingInvoicesApi';

export const useBillingInvoices = (page: number, size: number, search?: string, status?: InvoiceStatus) => {
  return useQuery({
    queryKey: ['billing-invoices', { page, size, search, status }],
    queryFn: () => billingInvoicesApi.getAll({ page, size, search, status }),
  });
};

export const useBillingInvoiceDetail = (invoiceId: number | null) => {
  return useQuery({
    queryKey: ['billing-invoices', 'detail', invoiceId],
    queryFn: () => {
      if (invoiceId === null) {
        throw new Error('invoiceId is required');
      }
      return billingInvoicesApi.getById(invoiceId);
    },
    enabled: invoiceId !== null,
  });
};

export const useInvoicedOrderIds = (orderIds: number[]) => {
  return useQuery({
    queryKey: ['billing-invoices', 'invoiced-order-ids', orderIds],
    queryFn: () => billingInvoicesApi.getInvoicedOrderIds(orderIds),
    enabled: orderIds.length > 0,
  });
};
