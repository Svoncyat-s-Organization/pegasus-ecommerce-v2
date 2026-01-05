import { useQuery } from '@tanstack/react-query';
import { adminOrdersApi } from '../api/adminOrdersApi';

export const useAdminOrders = (page: number, size: number, search?: string) => {
  return useQuery({
    queryKey: ['admin-orders', page, size, search],
    queryFn: () => adminOrdersApi.getAll({ page, size, search: search || undefined }),
  });
};
