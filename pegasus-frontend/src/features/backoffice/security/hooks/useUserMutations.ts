import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { usersApi } from '../api/usersApi';
import type { CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from '@types';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => usersApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Usuario creado exitosamente');
    },
    onError: () => {
      message.error('Error al crear el usuario');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UpdateUserRequest }) =>
      usersApi.updateUser(id, userData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      message.success('Usuario actualizado exitosamente');
    },
    onError: () => {
      message.error('Error al actualizar el usuario');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ id, passwordData }: { id: number; passwordData: ChangePasswordRequest }) =>
      usersApi.changePassword(id, passwordData),
    onSuccess: () => {
      message.success('Contraseña cambiada exitosamente');
    },
    onError: () => {
      message.error('Error al cambiar la contraseña');
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Estado del usuario actualizado');
    },
    onError: () => {
      message.error('Error al cambiar el estado del usuario');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Usuario eliminado exitosamente');
    },
    onError: () => {
      message.error('Error al eliminar el usuario');
    },
  });
};
