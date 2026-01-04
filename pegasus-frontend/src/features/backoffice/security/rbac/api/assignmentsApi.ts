import { api } from '@config/api';
import type {
  RoleWithModulesResponse,
  UserWithRolesResponse,
  AssignModulesToRoleRequest,
  AssignRolesToUserRequest,
} from '@types';

const PERMISSIONS_URL = '/admin/rbac/permissions';
const ASSIGNMENTS_URL = '/admin/rbac/assignments';

export const assignmentsApi = {
  // ===== Role-Module (Permissions) =====
  
  // Get modules assigned to a role
  getModulesByRole: async (roleId: number): Promise<RoleWithModulesResponse> => {
    const { data } = await api.get<RoleWithModulesResponse>(
      `${PERMISSIONS_URL}/roles/${roleId}/modules`
    );
    return data;
  },

  // Assign modules to a role (replaces previous assignments)
  assignModulesToRole: async (request: AssignModulesToRoleRequest): Promise<void> => {
    await api.post(`${PERMISSIONS_URL}/assign`, request);
  },

  // Revoke a specific module from a role
  revokeModuleFromRole: async (roleId: number, moduleId: number): Promise<void> => {
    await api.delete(`${PERMISSIONS_URL}/roles/${roleId}/modules/${moduleId}`);
  },

  // Revoke all modules from a role
  revokeAllModulesFromRole: async (roleId: number): Promise<void> => {
    await api.delete(`${PERMISSIONS_URL}/roles/${roleId}/modules`);
  },

  // ===== Role-User (Assignments) =====

  // Get roles assigned to a user
  getRolesByUser: async (userId: number): Promise<UserWithRolesResponse> => {
    const { data } = await api.get<UserWithRolesResponse>(
      `${ASSIGNMENTS_URL}/users/${userId}/roles`
    );
    return data;
  },

  // Get users assigned to a role
  getUsersByRole: async (roleId: number): Promise<number[]> => {
    const { data } = await api.get<number[]>(
      `${ASSIGNMENTS_URL}/roles/${roleId}/users`
    );
    return data;
  },

  // Assign roles to a user (replaces previous assignments)
  assignRolesToUser: async (request: AssignRolesToUserRequest): Promise<void> => {
    await api.post(`${ASSIGNMENTS_URL}/assign`, request);
  },

  // Revoke a specific role from a user
  revokeRoleFromUser: async (userId: number, roleId: number): Promise<void> => {
    await api.delete(`${ASSIGNMENTS_URL}/users/${userId}/roles/${roleId}`);
  },

  // Revoke all roles from a user
  revokeAllRolesFromUser: async (userId: number): Promise<void> => {
    await api.delete(`${ASSIGNMENTS_URL}/users/${userId}/roles`);
  },
};
