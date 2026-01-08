import { useQuery } from '@tanstack/react-query';
import { getRmaById } from '../api/rmasApi';

/**
 * Hook para obtener el detalle completo de una devolución
 */
export const useRmaDetail = (rmaId: number | null) => {
    return useQuery({
        queryKey: ['storefront', 'rma', rmaId],
        queryFn: () => getRmaById(rmaId!),
        enabled: rmaId !== null,
    });
};
