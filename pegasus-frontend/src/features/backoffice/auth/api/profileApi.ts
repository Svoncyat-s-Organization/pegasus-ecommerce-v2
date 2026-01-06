import { api } from '@config/api';
import type { UserResponse, UpdateUserRequest, ChangePasswordRequest } from '@types';

/**
 * GET /api/admin/profile - Obtener perfil del usuario autenticado
 */
export const getProfile = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>('/admin/profile');
  return response.data;
};

/**
 * PUT /api/admin/profile - Actualizar perfil del usuario autenticado
 */
export const updateProfile = async (data: UpdateUserRequest): Promise<UserResponse> => {
  const response = await api.put<UserResponse>('/admin/profile', data);
  return response.data;
};

/**
 * PATCH /api/admin/profile/password - Cambiar contraseña del usuario autenticado
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await api.patch('/admin/profile/password', data);
};
