import { useQuery } from '@tanstack/react-query';
import { getRmasByOrder } from '../api/rmasApi';

/**
 * Hook para obtener las devoluciones de un pedido específico
 */
export const useOrderRmas = (orderId: number | null, page: number = 0, size: number = 10) => {
    return useQuery({
        queryKey: ['storefront', 'order-rmas', orderId, page, size],
        queryFn: () => getRmasByOrder(orderId!, page, size),
        enabled: orderId !== null,
    });
};
