import { useQuery } from '@tanstack/react-query';
import { warehousesApi } from '../api/warehousesApi';

export const useActiveWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses', 'active'],
    queryFn: () => warehousesApi.getActiveWarehouses(),
    staleTime: 1000 * 60 * 10,
  });
};
