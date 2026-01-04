import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import type { UserDetail } from '@types';

export const useUsers = (page = 0, size = 10, search?: string) => {
  return useQuery({
    queryKey: ['users', page, size, search],
    queryFn: () => usersApi.getUsers(page, size, search),
  });
};

export const useUser = (id: number, options?: Omit<UseQueryOptions<UserDetail>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
    ...options,
  });
};
