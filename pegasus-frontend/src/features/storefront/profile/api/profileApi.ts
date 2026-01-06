import { api } from '@config/api';
import type {
  CustomerResponse,
  UpdateCustomerRequest,
  CustomerAddressResponse,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
} from '@types';

/**
 * Get authenticated customer profile
 * GET /api/storefront/profile
 */
export const getMyProfile = async (): Promise<CustomerResponse> => {
  const { data } = await api.get<CustomerResponse>('/storefront/profile');
  return data;
};

/**
 * Update authenticated customer profile
 * PUT /api/storefront/profile
 */
export const updateMyProfile = async (request: UpdateCustomerRequest): Promise<CustomerResponse> => {
  const { data } = await api.put<CustomerResponse>('/storefront/profile', request);
  return data;
};

/**
 * Get authenticated customer addresses
 * GET /api/storefront/profile/addresses
 */
export const getMyAddresses = async (): Promise<CustomerAddressResponse[]> => {
  const { data } = await api.get<CustomerAddressResponse[]>('/storefront/profile/addresses');
  return data;
};

/**
 * Create new address for authenticated customer
 * POST /api/storefront/profile/addresses
 */
export const createMyAddress = async (
  request: CreateCustomerAddressRequest
): Promise<CustomerAddressResponse> => {
  const { data } = await api.post<CustomerAddressResponse>('/storefront/profile/addresses', request);
  return data;
};

/**
 * Update address for authenticated customer
 * PUT /api/storefront/profile/addresses/{addressId}
 */
export const updateMyAddress = async (
  addressId: number,
  request: UpdateCustomerAddressRequest
): Promise<CustomerAddressResponse> => {
  const { data } = await api.put<CustomerAddressResponse>(
    `/storefront/profile/addresses/${addressId}`,
    request
  );
  return data;
};

/**
 * Delete address for authenticated customer
 * DELETE /api/storefront/profile/addresses/{addressId}
 */
export const deleteMyAddress = async (addressId: number): Promise<void> => {
  await api.delete(`/storefront/profile/addresses/${addressId}`);
};

/**
 * Set address as default shipping
 * PUT /api/storefront/profile/addresses/{addressId}/set-default-shipping
 */
export const setDefaultShipping = async (addressId: number): Promise<CustomerAddressResponse> => {
  const { data } = await api.put<CustomerAddressResponse>(
    `/storefront/profile/addresses/${addressId}/set-default-shipping`
  );
  return data;
};

/**
 * Set address as default billing
 * PUT /api/storefront/profile/addresses/{addressId}/set-default-billing
 */
export const setDefaultBilling = async (addressId: number): Promise<CustomerAddressResponse> => {
  const { data } = await api.put<CustomerAddressResponse>(
    `/storefront/profile/addresses/${addressId}/set-default-billing`
  );
  return data;
};
