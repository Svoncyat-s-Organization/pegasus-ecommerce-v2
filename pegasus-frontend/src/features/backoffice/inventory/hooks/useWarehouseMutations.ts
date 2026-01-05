import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  createWarehouse,
  updateWarehouse,
  toggleWarehouseStatus,
  deleteWarehouse,
} from '../api/warehousesApi';
import type { CreateWarehouseRequest, UpdateWarehouseRequest } from '@types';

/**
 * Hook for warehouse mutations
 */
export const useWarehouseMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (request: CreateWarehouseRequest) => createWarehouse(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      message.success('Almacén creado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear almacén');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateWarehouseRequest }) =>
      updateWarehouse(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse'] });
      message.success('Almacén actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar almacén');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => toggleWarehouseStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse'] });
      message.success('Estado del almacén actualizado');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al cambiar estado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      message.success('Almacén eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al eliminar almacén');
    },
  });

  return {
    createWarehouse: createMutation.mutateAsync,
    updateWarehouse: updateMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    deleteWarehouse: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
