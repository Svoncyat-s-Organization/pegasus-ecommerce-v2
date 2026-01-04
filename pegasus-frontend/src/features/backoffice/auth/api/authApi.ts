import { api } from '../../../../config/api';
import type { LoginRequest, AuthResponse } from '../../../../types';

export const authApi = {
  adminLogin: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/admin/login', credentials);
    return data;
  },

  customerLogin: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/customer/login', credentials);
    return data;
  },
};
