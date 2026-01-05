import { useQuery } from '@tanstack/react-query';
import { purchasesApi } from '../api/purchasesApi';

export const usePurchases = (page: number, size: number, search?: string) => {
  return useQuery({
    queryKey: ['purchases', page, size, search],
    queryFn: () => purchasesApi.getPurchases(page, size, search),
  });
};

export const usePurchaseById = (purchaseId: number | null) => {
  return useQuery({
    queryKey: ['purchases', 'detail', purchaseId],
    queryFn: () => purchasesApi.getPurchaseById(purchaseId as number),
    enabled: typeof purchaseId === 'number',
  });
};
