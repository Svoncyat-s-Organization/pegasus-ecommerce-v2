import { api } from '@config/api';
import type {
  BusinessInfoResponse,
  UpdateBusinessInfoRequest,
  StorefrontSettingsResponse,
  UpdateStorefrontSettingsRequest,
} from '@types';

// ==================== BUSINESS INFO ====================

/**
 * Obtiene la información de la empresa
 */
export const getBusinessInfo = async (): Promise<BusinessInfoResponse> => {
  const { data } = await api.get('/admin/settings/business');
  return data;
};

/**
 * Actualiza la información de la empresa
 */
export const updateBusinessInfo = async (
  request: UpdateBusinessInfoRequest
): Promise<BusinessInfoResponse> => {
  const { data } = await api.put('/admin/settings/business', request);
  return data;
};

// ==================== STOREFRONT SETTINGS ====================

/**
 * Obtiene la configuración del storefront
 */
export const getStorefrontSettings = async (): Promise<StorefrontSettingsResponse> => {
  const { data } = await api.get('/admin/settings/storefront');
  return data;
};

/**
 * Actualiza la configuración del storefront
 */
export const updateStorefrontSettings = async (
  request: UpdateStorefrontSettingsRequest
): Promise<StorefrontSettingsResponse> => {
  const { data } = await api.put('/admin/settings/storefront', request);
  return data;
};
