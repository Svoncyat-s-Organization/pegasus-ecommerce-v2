import { useQuery } from '@tanstack/react-query';
import { getPublicStorefrontSettings, getPublicBusinessInfo } from '../api/settingsApi';

/**
 * Hook to fetch public storefront settings
 * Used for theme colors, logo, policies, etc.
 */
export const usePublicStorefrontSettings = () => {
  return useQuery({
    queryKey: ['public', 'storefront-settings'],
    queryFn: getPublicStorefrontSettings,
    staleTime: 1000 * 60 * 30, // 30 minutes - settings don't change often
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Hook to fetch public business info
 * Used for company name, contact, social media, etc.
 */
export const usePublicBusinessInfo = () => {
  return useQuery({
    queryKey: ['public', 'business-info'],
    queryFn: getPublicBusinessInfo,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
};
