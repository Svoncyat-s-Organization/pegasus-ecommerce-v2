import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { assignmentsApi } from '../api/assignmentsApi';
import type { AssignModulesToRoleRequest, AssignRolesToUserRequest } from '@types';

// ===== Queries =====

// Get modules assigned to a role
export const useModulesByRole = (roleId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['role-modules', roleId],
    queryFn: () => assignmentsApi.getModulesByRole(roleId),
    enabled: options?.enabled !== false && roleId > 0,
  });
};

// Get roles assigned to a user
export const useRolesByUser = (userId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: () => assignmentsApi.getRolesByUser(userId),
    enabled: options?.enabled !== false && userId > 0,
  });
};

// Get users assigned to a role
export const useUsersByRole = (roleId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['role-users', roleId],
    queryFn: () => assignmentsApi.getUsersByRole(roleId),
    enabled: options?.enabled !== false && roleId > 0,
  });
};

// ===== Mutations =====

// Assign modules to a role
export const useAssignModulesToRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignModulesToRoleRequest) => 
      assignmentsApi.assignModulesToRole(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role-modules', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      message.success('Permisos asignados exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al asignar permisos');
    },
  });
};

// Assign roles to a user
export const useAssignRolesToUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignRolesToUserRequest) => 
      assignmentsApi.assignRolesToUser(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Roles asignados exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al asignar roles');
    },
  });
};

// Revoke module from role
export const useRevokeModuleFromRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, moduleId }: { roleId: number; moduleId: number }) =>
      assignmentsApi.revokeModuleFromRole(roleId, moduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role-modules', variables.roleId] });
      message.success('Permiso revocado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al revocar permiso');
    },
  });
};

// Revoke role from user
export const useRevokeRoleFromUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      assignmentsApi.revokeRoleFromUser(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
      message.success('Rol revocado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al revocar rol');
    },
  });
};
