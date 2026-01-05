import { api } from '@config/api';
import type {
  CustomerResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerAddressResponse,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
  PageResponse,
} from '@types';

const BASE_URL = '/admin/customers';

export const customersApi = {
  // ==================== CUSTOMERS ====================
  
  // Get paginated customers
  getCustomers: async (page = 0, size = 20, search?: string): Promise<PageResponse<CustomerResponse>> => {
    const { data } = await api.get<PageResponse<CustomerResponse>>(BASE_URL, {
      params: { page, size, search },
    });
    return data;
  },

  // Get customer by ID
  getCustomerById: async (id: number): Promise<CustomerResponse> => {
    const { data } = await api.get<CustomerResponse>(`${BASE_URL}/${id}`);
    return data;
  },

  // Create customer
  createCustomer: async (customerData: CreateCustomerRequest): Promise<CustomerResponse> => {
    const { data } = await api.post<CustomerResponse>(BASE_URL, customerData);
    return data;
  },

  // Update customer
  updateCustomer: async (id: number, customerData: UpdateCustomerRequest): Promise<CustomerResponse> => {
    const { data } = await api.put<CustomerResponse>(`${BASE_URL}/${id}`, customerData);
    return data;
  },

  // Delete customer (soft delete)
  deleteCustomer: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // Toggle customer status
  toggleCustomerStatus: async (id: number): Promise<CustomerResponse> => {
    const { data } = await api.put<CustomerResponse>(`${BASE_URL}/${id}/toggle-status`);
    return data;
  },

  // ==================== ADDRESSES ====================
  
  // Get all addresses for a customer
  getCustomerAddresses: async (customerId: number): Promise<CustomerAddressResponse[]> => {
    const { data } = await api.get<CustomerAddressResponse[]>(`${BASE_URL}/${customerId}/addresses`);
    return data;
  },

  // Create address
  createAddress: async (
    customerId: number,
    addressData: CreateCustomerAddressRequest
  ): Promise<CustomerAddressResponse> => {
    const { data } = await api.post<CustomerAddressResponse>(
      `${BASE_URL}/${customerId}/addresses`,
      addressData
    );
    return data;
  },

  // Update address
  updateAddress: async (
    customerId: number,
    addressId: number,
    addressData: UpdateCustomerAddressRequest
  ): Promise<CustomerAddressResponse> => {
    const { data } = await api.put<CustomerAddressResponse>(
      `${BASE_URL}/${customerId}/addresses/${addressId}`,
      addressData
    );
    return data;
  },

  // Delete address
  deleteAddress: async (customerId: number, addressId: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${customerId}/addresses/${addressId}`);
  },

  // Set default shipping address
  setDefaultShipping: async (customerId: number, addressId: number): Promise<CustomerAddressResponse> => {
    const { data } = await api.put<CustomerAddressResponse>(
      `${BASE_URL}/${customerId}/addresses/${addressId}/set-default-shipping`
    );
    return data;
  },

  // Set default billing address
  setDefaultBilling: async (customerId: number, addressId: number): Promise<CustomerAddressResponse> => {
    const { data } = await api.put<CustomerAddressResponse>(
      `${BASE_URL}/${customerId}/addresses/${addressId}/set-default-billing`
    );
    return data;
  },
};
