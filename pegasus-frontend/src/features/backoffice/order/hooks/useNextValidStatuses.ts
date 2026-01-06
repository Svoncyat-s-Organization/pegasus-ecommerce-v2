import { useQuery } from '@tanstack/react-query';
import { getNextValidStatuses } from '../api/ordersApi';

/**
 * Hook para obtener los estados siguientes válidos del pedido
 */
export const useNextValidStatuses = (orderId: number | null) => {
  return useQuery({
    queryKey: ['next-valid-statuses', orderId],
    queryFn: () => getNextValidStatuses(orderId!),
    enabled: !!orderId,
    staleTime: 0, // Siempre fresh para obtener la última información
  });
};
