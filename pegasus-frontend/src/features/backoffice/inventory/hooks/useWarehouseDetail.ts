import { useQuery } from '@tanstack/react-query';
import { getWarehouseById, getActiveWarehouses } from '../api/warehousesApi';

/**
 * Hook for fetching warehouse details
 */
export const useWarehouseDetail = (warehouseId: number | null) => {
  return useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: () => getWarehouseById(warehouseId!),
    enabled: !!warehouseId,
  });
};

/**
 * Hook for fetching active warehouses (for selectors)
 */
export const useActiveWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses', 'active'],
    queryFn: getActiveWarehouses,
  });
};
