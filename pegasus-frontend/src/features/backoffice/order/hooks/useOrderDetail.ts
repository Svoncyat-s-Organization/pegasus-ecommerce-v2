import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../api/ordersApi';

/**
 * Hook para obtener el detalle completo de un pedido
 * Se refresca automáticamente cuando las queries se invalidan
 */
export const useOrderDetail = (orderId: number | null) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId, // Only run if orderId is provided
    refetchOnMount: 'always', // Siempre refrescar al montar
    refetchOnWindowFocus: true, // Refrescar cuando vuelves a la ventana
    staleTime: 0, // Los datos siempre son considerados obsoletos
  });
};
