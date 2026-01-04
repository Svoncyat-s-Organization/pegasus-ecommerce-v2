import { api } from '@config/api';
import type {
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@types';

const BASE_URL = '/admin/rbac/roles';

export const rolesApi = {
  // Get all roles
  getRoles: async (): Promise<RoleResponse[]> => {
    const { data } = await api.get<RoleResponse[]>(BASE_URL);
    return data;
  },

  // Get role by ID
  getRoleById: async (id: number): Promise<RoleResponse> => {
    const { data } = await api.get<RoleResponse>(`${BASE_URL}/${id}`);
    return data;
  },

  // Create role
  createRole: async (roleData: CreateRoleRequest): Promise<RoleResponse> => {
    const { data } = await api.post<RoleResponse>(BASE_URL, roleData);
    return data;
  },

  // Update role
  updateRole: async (id: number, roleData: UpdateRoleRequest): Promise<RoleResponse> => {
    const { data } = await api.put<RoleResponse>(`${BASE_URL}/${id}`, roleData);
    return data;
  },

  // Delete role
  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
