import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/rolesApi';

// Get all roles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getRoles,
  });
};

// Get role by ID
export const useRole = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => rolesApi.getRoleById(id),
    enabled: options?.enabled !== false && id > 0,
  });
};
