import { api } from '@config/api';
import type { WarehouseResponse } from '@types';

const BASE_URL = '/warehouses';

export const warehousesApi = {
  getActiveWarehouses: async (): Promise<WarehouseResponse[]> => {
    const { data } = await api.get<WarehouseResponse[]>(`${BASE_URL}/active`);
    return data;
  },
};
