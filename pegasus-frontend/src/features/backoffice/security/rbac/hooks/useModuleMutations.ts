import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { modulesApi } from '../api/modulesApi';
import type { CreateModuleRequest, UpdateModuleRequest } from '@types';

export const useCreateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleData: CreateModuleRequest) => modulesApi.createModule(moduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      message.success('Módulo creado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear el módulo');
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, moduleData }: { id: number; moduleData: UpdateModuleRequest }) =>
      modulesApi.updateModule(id, moduleData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['module', variables.id] });
      message.success('Módulo actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar el módulo');
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => modulesApi.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      message.success('Módulo eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar el módulo');
    },
  });
};
