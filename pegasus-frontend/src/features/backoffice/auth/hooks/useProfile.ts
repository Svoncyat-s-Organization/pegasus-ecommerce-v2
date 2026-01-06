import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/profileApi';

/**
 * Hook para obtener el perfil del usuario autenticado
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
