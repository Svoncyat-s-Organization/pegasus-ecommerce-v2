import { api } from '@config/api';
import type {
    RmaResponse,
    RmaSummaryResponse,
    PageResponse,
    CreateRmaRequest,
} from '@types';

/**
 * API para gestión de RMAs en Storefront (Clientes)
 * Los clientes solo pueden crear RMAs y ver sus propias solicitudes.
 * Los estados se actualizan solo desde el backoffice.
 */

/**
 * Crear una nueva solicitud de devolución
 * El cliente puede crear RMAs para pedidos entregados.
 * La solicitud inicia en estado PENDING y debe ser aprobada desde el backoffice.
 */
export const createRma = async (request: CreateRmaRequest): Promise<RmaResponse> => {
    const { data } = await api.post('/storefront/rmas', request);
    return data;
};

/**
 * Obtener todas las solicitudes de devolución del cliente autenticado
 */
export const getMyRmas = async (
    page: number,
    size: number
): Promise<PageResponse<RmaSummaryResponse>> => {
    const { data } = await api.get('/storefront/rmas', {
        params: { page, size },
    });
    return data;
};

/**
 * Obtener detalle completo de una solicitud de devolución
 */
export const getRmaById = async (id: number): Promise<RmaResponse> => {
    const { data } = await api.get(`/storefront/rmas/${id}`);
    return data;
};

/**
 * Obtener todas las devoluciones asociadas a un pedido específico del cliente
 */
export const getRmasByOrder = async (
    orderId: number,
    page: number,
    size: number
): Promise<PageResponse<RmaSummaryResponse>> => {
    const { data } = await api.get(`/storefront/rmas/by-order/${orderId}`, {
        params: { page, size },
    });
    return data;
};
