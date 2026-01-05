import { useQuery } from '@tanstack/react-query';
import { billingPaymentMethodsApi } from '../api/billingPaymentMethodsApi';

export const useBillingPaymentMethods = (page: number, size: number, search?: string) => {
  return useQuery({
    queryKey: ['billing-payment-methods', { page, size, search }],
    queryFn: () => billingPaymentMethodsApi.getAll({ page, size, search }),
  });
};
