import { api } from '@config/api';
import type { DashboardSummaryResponse } from '@types';

/**
 * Obtiene el resumen completo del dashboard
 * Un solo endpoint optimizado que retorna todas las métricas
 */
export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};
