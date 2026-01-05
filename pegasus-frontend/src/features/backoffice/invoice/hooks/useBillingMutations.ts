import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  CreateInvoiceRequest,
  CreatePaymentMethodRequest,
  CreatePaymentRequest,
  UpdateInvoiceStatusRequest,
  UpdatePaymentMethodRequest,
} from '@types';
import { billingInvoicesApi } from '../api/billingInvoicesApi';
import { billingPaymentMethodsApi } from '../api/billingPaymentMethodsApi';
import { billingPaymentsApi } from '../api/billingPaymentsApi';

export const useCreateBillingInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateInvoiceRequest) => billingInvoicesApi.create(request),
    onSuccess: () => {
      message.success('Comprobante creado');
      queryClient.invalidateQueries({ queryKey: ['billing-invoices'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear comprobante');
    },
  });
};

export const useUpdateBillingInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number; request: UpdateInvoiceStatusRequest }) =>
      billingInvoicesApi.updateStatus(params.id, params.request),
    onSuccess: () => {
      message.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: ['billing-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing-invoices', 'detail'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar estado');
    },
  });
};

export const useCreateBillingPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePaymentRequest) => billingPaymentsApi.create(request),
    onSuccess: () => {
      message.success('Pago registrado');
      queryClient.invalidateQueries({ queryKey: ['billing-payments'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al registrar pago');
    },
  });
};

export const useCreateBillingPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePaymentMethodRequest) => billingPaymentMethodsApi.create(request),
    onSuccess: () => {
      message.success('Método de pago creado');
      queryClient.invalidateQueries({ queryKey: ['billing-payment-methods'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear método de pago');
    },
  });
};

export const useUpdateBillingPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number; request: UpdatePaymentMethodRequest }) =>
      billingPaymentMethodsApi.update(params.id, params.request),
    onSuccess: () => {
      message.success('Método de pago actualizado');
      queryClient.invalidateQueries({ queryKey: ['billing-payment-methods'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar método de pago');
    },
  });
};

export const useToggleBillingPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => billingPaymentMethodsApi.toggle(id),
    onSuccess: () => {
      message.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: ['billing-payment-methods'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al actualizar estado');
    },
  });
};
