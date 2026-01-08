import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { updateProfile, changePassword } from '../api/profileApi';
import type { UpdateUserRequest, ChangePasswordRequest } from '@types';
import { useAuthStore } from '@stores/backoffice/authStore';

/**
 * Hook para actualizar el perfil del usuario autenticado
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, setAuth, token } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateProfile(data),
    onSuccess: (data) => {
      // Actualizar el perfil en el cache de React Query
      queryClient.setQueryData(['profile'], data);
      
      // Si el email cambió, actualizar el store de autenticación
      if (user && data.email !== user.email && token) {
        setAuth(
          {
            userId: user.userId,
            email: data.email,
            username: user.username,
            userType: user.userType,
          },
          token
        );
      }
      
      message.success('Perfil actualizado exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      message.error(errorMessage);
    },
  });
};

/**
 * Hook para cambiar la contraseña del usuario autenticado
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: () => {
      message.success('Contraseña actualizada exitosamente');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      message.error(errorMessage);
    },
  });
};
