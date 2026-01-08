import { create } from 'zustand';
import type { StorefrontSettingsResponse, BusinessInfoResponse } from '@types';

interface StorefrontConfigState {
  settings: StorefrontSettingsResponse | null;
  businessInfo: BusinessInfoResponse | null;
  isLoading: boolean;
  setSettings: (settings: StorefrontSettingsResponse) => void;
  setBusinessInfo: (info: BusinessInfoResponse) => void;
  setLoading: (loading: boolean) => void;
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
  getStoreName: () => string;
  getLogoUrl: () => string | null;
  getHeroImageUrl: () => string | null;
  getContactPhone: () => string | null;
}

export const useStorefrontConfigStore = create<StorefrontConfigState>()((set, get) => ({
  settings: null,
  businessInfo: null,
  isLoading: true,

  setSettings: (settings) => set({ settings }),
  setBusinessInfo: (info) => set({ businessInfo: info }),
  setLoading: (loading) => set({ isLoading: loading }),

  getPrimaryColor: () => get().settings?.primaryColor || '#04213b',
  getSecondaryColor: () => get().settings?.secondaryColor || '#f2f2f2',
  getStoreName: () => get().settings?.storefrontName || 'Pegasus Store',
  getLogoUrl: () => get().settings?.logoUrl || null,
  getHeroImageUrl: () => get().settings?.heroImageUrl || null,
  getContactPhone: () => get().settings?.whatsappNumber || null,
}));
