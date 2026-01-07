import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@stores/backoffice/authStore';
import type { LoginRequest } from '@types';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.adminLogin(credentials),
    onSuccess: (data) => {
      const user = {
        userId: data.userId,
        email: data.email,
        username: data.username,
        userType: data.userType,
      };
      setAuth(user, data.token);
    },
  });
};
