import { api } from '@config/api';
import type { LoginRequest, RegisterCustomerRequest, AuthResponse } from '@types';

/**
 * Customer login
 * POST /api/auth/customer/login
 */
export const loginCustomer = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/customer/login', credentials);
  return data;
};

/**
 * Customer registration
 * POST /api/auth/customer/register
 */
export const registerCustomer = async (
  request: RegisterCustomerRequest
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/customer/register', request);
  return data;
};
