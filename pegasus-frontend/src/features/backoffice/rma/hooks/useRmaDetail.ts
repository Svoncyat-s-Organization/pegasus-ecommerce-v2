import { useQuery } from '@tanstack/react-query';
import { getRmaById } from '../api/rmasApi';

/**
 * Hook para obtener el detalle completo de un RMA
 */
export const useRmaDetail = (rmaId: number | null) => {
  return useQuery({
    queryKey: ['rma', rmaId],
    queryFn: () => getRmaById(rmaId!),
    enabled: !!rmaId,
  });
};
