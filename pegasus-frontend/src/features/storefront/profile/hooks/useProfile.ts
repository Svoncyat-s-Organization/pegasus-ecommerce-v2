import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyProfile,
  updateMyProfile,
  getMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress,
  setDefaultShipping,
  setDefaultBilling,
} from '../api/profileApi';
import type {
  UpdateCustomerRequest,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
} from '@types';

/**
 * Hook to fetch authenticated customer profile
 */
export const useMyProfile = () => {
  return useQuery({
    queryKey: ['storefront', 'profile'],
    queryFn: getMyProfile,
  });
};

/**
 * Hook to update authenticated customer profile
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateCustomerRequest) => updateMyProfile(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', 'profile'] });
    },
  });
};

/**
 * Hook to fetch authenticated customer addresses
 */
export const useMyAddresses = () => {
  return useQuery({
    queryKey: ['storefront', 'addresses'],
    queryFn: getMyAddresses,
  });
};

/**
 * Hook to create new address
 */
export const useCreateMyAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCustomerAddressRequest) => createMyAddress(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', 'addresses'] });
    },
  });
};

/**
 * Hook to update address
 */
export const useUpdateMyAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, request }: { addressId: number; request: UpdateCustomerAddressRequest }) =>
      updateMyAddress(addressId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', 'addresses'] });
    },
  });
};

/**
 * Hook to delete address
 */
export const useDeleteMyAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: number) => deleteMyAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', 'addresses'] });
    },
  });
};

/**
 * Hook to set default shipping address
 */
export const useSetDefaultShipping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: number) => setDefaultShipping(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', 'addresses'] });
    },
  });
};

/**
 * Hook to set default billing address
 */
export const useSetDefaultBilling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: number) => setDefaultBilling(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront', 'addresses'] });
    },
  });
};
