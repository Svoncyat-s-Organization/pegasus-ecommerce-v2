import { api } from '@config/api';
import type { StorefrontSettingsResponse, BusinessInfoResponse } from '@types';

/**
 * Get public storefront settings (no auth required)
 * GET /api/public/storefront-settings
 */
export const getPublicStorefrontSettings = async (): Promise<StorefrontSettingsResponse> => {
  const { data } = await api.get<StorefrontSettingsResponse>('/public/storefront-settings');
  return data;
};

/**
 * Get public business info (no auth required)
 * GET /api/public/business-info
 */
export const getPublicBusinessInfo = async (): Promise<BusinessInfoResponse> => {
  const { data } = await api.get<BusinessInfoResponse>('/public/business-info');
  return data;
};
