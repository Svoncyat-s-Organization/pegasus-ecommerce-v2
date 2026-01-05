import { useQuery } from '@tanstack/react-query';
import { getShippingMethods } from '../api/checkoutApi';

/**
 * Hook to fetch available shipping methods
 */
export const useShippingMethods = () => {
  return useQuery({
    queryKey: ['shipping-methods'],
    queryFn: getShippingMethods,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
