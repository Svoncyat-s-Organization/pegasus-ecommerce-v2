import { useQuery } from '@tanstack/react-query';
import { billingPaymentsApi } from '../api/billingPaymentsApi';

export const useBillingPayments = (
  page: number,
  size: number,
  params?: {
    search?: string;
    orderId?: number;
    paymentMethodId?: number;
  }
) => {
  return useQuery({
    queryKey: ['billing-payments', { page, size, ...params }],
    queryFn: () => billingPaymentsApi.getAll({ page, size, ...params }),
  });
};

export const useBillingPaymentDetail = (paymentId: number | null) => {
  return useQuery({
    queryKey: ['billing-payments', 'detail', paymentId],
    queryFn: () => {
      if (paymentId === null) {
        throw new Error('paymentId is required');
      }
      return billingPaymentsApi.getById(paymentId);
    },
    enabled: paymentId !== null,
  });
};
