import { useQuery } from '@tanstack/react-query';
import { getAllBrands } from '../api/catalogApi';

/**
 * Hook para obtener todas las marcas
 */
export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: getAllBrands,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
