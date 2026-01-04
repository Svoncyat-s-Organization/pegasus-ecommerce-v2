import { api } from '@config/api';
import type {
  ModuleResponse,
  CreateModuleRequest,
  UpdateModuleRequest,
} from '@types';

const BASE_URL = '/admin/rbac/modules';

export const modulesApi = {
  // Get all modules
  getModules: async (): Promise<ModuleResponse[]> => {
    const { data } = await api.get<ModuleResponse[]>(BASE_URL);
    return data;
  },

  // Get module by ID
  getModuleById: async (id: number): Promise<ModuleResponse> => {
    const { data } = await api.get<ModuleResponse>(`${BASE_URL}/${id}`);
    return data;
  },

  // Create module
  createModule: async (moduleData: CreateModuleRequest): Promise<ModuleResponse> => {
    const { data } = await api.post<ModuleResponse>(BASE_URL, moduleData);
    return data;
  },

  // Update module
  updateModule: async (id: number, moduleData: UpdateModuleRequest): Promise<ModuleResponse> => {
    const { data } = await api.put<ModuleResponse>(`${BASE_URL}/${id}`, moduleData);
    return data;
  },

  // Delete module
  deleteModule: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
