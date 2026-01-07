import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { loginCustomer, registerCustomer } from '../api/authApi';
import { useStorefrontAuthStore } from '@stores/storefront/authStore';
import type { LoginRequest, RegisterCustomerRequest } from '@types';

/**
 * Hook para autenticación de clientes (login y registro)
 */
export const useCustomerAuth = () => {
  const navigate = useNavigate();
  const { setAuth } = useStorefrontAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => loginCustomer(credentials),
    onSuccess: (response) => {
      // Store token and user data
      const user = {
        userId: response.userId,
        email: response.email,
        username: response.username,
        userType: response.userType,
      };
      setAuth(user, response.token);

      // Store token in localStorage for axios interceptor
      localStorage.setItem('storefront-token', response.token);

      message.success('Inicio de sesión exitoso');
      navigate('/home');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al iniciar sesión');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (request: RegisterCustomerRequest) => registerCustomer(request),
    onSuccess: (response) => {
      // Store token and user data
      const user = {
        userId: response.userId,
        email: response.email,
        username: response.username,
        userType: response.userType,
      };
      setAuth(user, response.token);

      // Store token in localStorage for axios interceptor
      localStorage.setItem('storefront-token', response.token);

      message.success('Registro exitoso. ¡Bienvenido!');
      navigate('/home');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al registrarse');
    },
  });

  const logout = () => {
    useStorefrontAuthStore.getState().logout();
    localStorage.removeItem('storefront-token');
    message.info('Sesión cerrada');
    navigate('/home');
  };

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  };
};
