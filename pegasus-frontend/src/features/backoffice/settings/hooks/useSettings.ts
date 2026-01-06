import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getBusinessInfo,
  updateBusinessInfo,
  getStorefrontSettings,
  updateStorefrontSettings,
} from '../api/settingsApi';
import type { UpdateBusinessInfoRequest, UpdateStorefrontSettingsRequest } from '@types';

// ==================== BUSINESS INFO ====================

/**
 * Hook para obtener la información de la empresa
 */
export const useBusinessInfo = () => {
  return useQuery({
    queryKey: ['settings', 'business'],
    queryFn: getBusinessInfo,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para actualizar la información de la empresa
 */
export const useUpdateBusinessInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateBusinessInfoRequest) => updateBusinessInfo(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'business'] });
      message.success('Información de la empresa actualizada correctamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar la información');
    },
  });
};

// ==================== STOREFRONT SETTINGS ====================

/**
 * Hook para obtener la configuración del storefront
 */
export const useStorefrontSettings = () => {
  return useQuery({
    queryKey: ['settings', 'storefront'],
    queryFn: getStorefrontSettings,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para actualizar la configuración del storefront
 */
export const useUpdateStorefrontSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateStorefrontSettingsRequest) => updateStorefrontSettings(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'storefront'] });
      message.success('Configuración del storefront actualizada correctamente');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar la configuración');
    },
  });
};
