import { useQuery } from '@tanstack/react-query';
import { getMyRmas } from '../api/rmasApi';

/**
 * Hook para obtener las devoluciones del cliente autenticado con paginación
 */
export const useMyRmas = (page: number, size: number = 20) => {
    return useQuery({
        queryKey: ['storefront', 'rmas', page, size],
        queryFn: () => getMyRmas(page, size),
    });
};
