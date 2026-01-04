import { api } from '@config/api';

export interface DepartmentResponse {
  id: string;
  name: string;
}

export interface ProvinceResponse {
  id: string;
  name: string;
}

export interface DistrictResponse {
  id: string;
  name: string;
}

const BASE_URL = '/locations';

export const locationsApi = {
  // Get all departments
  getDepartments: async (): Promise<DepartmentResponse[]> => {
    const { data } = await api.get<DepartmentResponse[]>(`${BASE_URL}/departments`);
    return data;
  },

  // Get provinces by department
  getProvincesByDepartment: async (departmentId: string): Promise<ProvinceResponse[]> => {
    const { data } = await api.get<ProvinceResponse[]>(`${BASE_URL}/provinces/${departmentId}`);
    return data;
  },

  // Get districts by province
  getDistrictsByProvince: async (provinceId: string): Promise<DistrictResponse[]> => {
    const { data } = await api.get<DistrictResponse[]>(`${BASE_URL}/districts/${provinceId}`);
    return data;
  },
};
