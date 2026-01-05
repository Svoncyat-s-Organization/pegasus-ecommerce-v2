import { useQuery } from '@tanstack/react-query';
import { billingDocumentSeriesApi } from '../api/billingDocumentSeriesApi';

export const useBillingDocumentSeries = (page: number, size: number, search?: string) => {
  return useQuery({
    queryKey: ['billing-document-series', page, size, search],
    queryFn: () => billingDocumentSeriesApi.getAll({ page, size, search: search || undefined }),
  });
};
