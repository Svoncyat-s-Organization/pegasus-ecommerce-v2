import { useQuery } from '@tanstack/react-query';
import { modulesApi } from '../api/modulesApi';

// Get all modules
export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: modulesApi.getModules,
  });
};

// Get module by ID
export const useModule = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => modulesApi.getModuleById(id),
    enabled: options?.enabled !== false && id > 0,
  });
};
