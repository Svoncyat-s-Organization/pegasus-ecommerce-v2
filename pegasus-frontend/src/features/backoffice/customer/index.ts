// Pages
export { CustomersListPage } from './pages/CustomersListPage';

// Components
export { CustomerFormModal } from './components/CustomerFormModal';
export { CustomerDetailModal } from './components/CustomerDetailModal';
export { AddressList } from './components/AddressList';
export { AddressFormModal } from './components/AddressFormModal';

// Hooks
export { useCustomers, useCustomer, useCustomerAddresses } from './hooks/useCustomers';
export {
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useToggleCustomerStatus,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultShipping,
  useSetDefaultBilling,
} from './hooks/useCustomerMutations';

// API
export { customersApi } from './api/customersApi';

// Constants
export { CUSTOMER_STATUS, DOCUMENT_TYPES, CUSTOMER_VALIDATION_RULES, ADDRESS_VALIDATION_RULES } from './constants/customerConstants';
