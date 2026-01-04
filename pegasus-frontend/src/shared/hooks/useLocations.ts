import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '../api/locationsApi';

/**
 * Hook para obtener todos los departamentos
 */
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => locationsApi.getDepartments(),
    staleTime: 1000 * 60 * 60, // 1 hour - data is static
  });
};

/**
 * Hook para obtener provincias por departamento
 */
export const useProvinces = (departmentId: string | undefined) => {
  return useQuery({
    queryKey: ['provinces', departmentId],
    queryFn: () => locationsApi.getProvincesByDepartment(departmentId!),
    enabled: !!departmentId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Hook para obtener distritos por provincia
 */
export const useDistricts = (provinceId: string | undefined) => {
  return useQuery({
    queryKey: ['districts', provinceId],
    queryFn: () => locationsApi.getDistrictsByProvince(provinceId!),
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
