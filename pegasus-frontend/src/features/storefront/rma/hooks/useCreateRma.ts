import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { createRma } from '../api/rmasApi';
import type { CreateRmaRequest } from '@types';

type ErrorWithMessage = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error !== 'object' || error === null) return fallback;
    const maybe = error as ErrorWithMessage;
    return maybe.response?.data?.message ?? fallback;
};

/**
 * Hook para crear una nueva solicitud de devolución
 */
export const useCreateRma = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateRmaRequest) => createRma(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storefront', 'rmas'] });
            message.success('Solicitud de devolución creada exitosamente');
        },
        onError: (error: unknown) => {
            message.error(getErrorMessage(error, 'Error al crear la solicitud de devolución'));
        },
    });
};
