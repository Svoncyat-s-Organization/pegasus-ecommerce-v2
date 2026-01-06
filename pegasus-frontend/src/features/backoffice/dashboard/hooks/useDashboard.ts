import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/dashboardApi';

/**
 * Hook para obtener datos del dashboard
 * Incluye auto-refresh cada 10 minutos y cache de 5 minutos
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10, // Auto-refresh cada 10 minutos
  });
};
