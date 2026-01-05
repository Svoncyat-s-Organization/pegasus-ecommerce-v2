import { useQuery } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';

export const useSuppliers = (page: number, size: number, search?: string) => {
  return useQuery({
    queryKey: ['suppliers', page, size, search],
    queryFn: () => suppliersApi.getSuppliers(page, size, search),
  });
};

export const useSupplierById = (supplierId: number | null) => {
  return useQuery({
    queryKey: ['suppliers', 'detail', supplierId],
    queryFn: () => suppliersApi.getSupplierById(supplierId as number),
    enabled: typeof supplierId === 'number',
  });
};
