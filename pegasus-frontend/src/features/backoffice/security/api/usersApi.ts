import { api } from '@config/api';
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  PageResponse,
} from '@types';

const BASE_URL = '/admin/users';

export const usersApi = {
  // Get paginated users with optional search
  getUsers: async (page = 0, size = 10, search?: string): Promise<PageResponse<UserResponse>> => {
    const { data } = await api.get<PageResponse<UserResponse>>(BASE_URL, {
      params: { 
        page, 
        size,
        ...(search && { search }),
      },
    });
    return data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>(`${BASE_URL}/${id}`);
    return data;
  },

  // Create user
  createUser: async (userData: CreateUserRequest): Promise<UserResponse> => {
    const { data } = await api.post<UserResponse>(BASE_URL, userData);
    return data;
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserRequest): Promise<UserResponse> => {
    const { data } = await api.put<UserResponse>(`${BASE_URL}/${id}`, userData);
    return data;
  },

  // Change password
  changePassword: async (id: number, passwordData: ChangePasswordRequest): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/password`, passwordData);
  },

  // Toggle active status
  toggleActive: async (id: number, isActive: boolean): Promise<void> => {
    await api.patch(`${BASE_URL}/${id}/status`, null, {
      params: { isActive },
    });
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
