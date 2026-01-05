import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../api/ordersApi';

/**
 * Hook para obtener el detalle completo de un pedido
 */
export const useOrderDetail = (orderId: number | null) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId, // Only run if orderId is provided
  });
};
