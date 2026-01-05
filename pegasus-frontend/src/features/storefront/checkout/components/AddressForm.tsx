import { Stack, TextInput, Textarea, Select, Group } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useState } from 'react';
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';
import type { DepartmentResponse, ProvinceResponse, DistrictResponse } from '@shared/api/locationsApi';
import type { CheckoutFormValues } from '../types/checkout.types';

interface AddressFormProps {
  form: UseFormReturnType<CheckoutFormValues>;
}

/**
 * AddressForm Component
 * Formulario para ingresar dirección de envío con ubigeo (Perú)
 */
export const AddressForm = ({ form }: AddressFormProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>();
  const [selectedProvince, setSelectedProvince] = useState<string>();

  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(selectedDepartment);
  const { data: districts } = useDistricts(selectedProvince);

  const handleDepartmentChange = (value: string | null) => {
    if (value) {
      setSelectedDepartment(value);
      setSelectedProvince(undefined);
      form.setFieldValue('shippingAddress.ubigeoId', '');
    }
  };

  const handleProvinceChange = (value: string | null) => {
    if (value) {
      setSelectedProvince(value);
      form.setFieldValue('shippingAddress.ubigeoId', '');
    }
  };

  const handleDistrictChange = (value: string | null) => {
    if (value) {
      form.setFieldValue('shippingAddress.ubigeoId', value);
      
      // Guardar nombres para display
      const district = districts?.find((d: DistrictResponse) => d.id === value);
      const province = provinces?.find((p: ProvinceResponse) => p.id === selectedProvince);
      const department = departments?.find((d: DepartmentResponse) => d.id === selectedDepartment);
      
      if (district && province && department) {
        form.setFieldValue('shippingAddress.districtName', district.name);
        form.setFieldValue('shippingAddress.provinceName', province.name);
        form.setFieldValue('shippingAddress.departmentName', department.name);
      }
    }
  };

  return (
    <Stack gap="md">
      {/* Nombre del destinatario */}
      <TextInput
        label="Nombre del destinatario"
        placeholder="Juan Pérez García"
        required
        {...form.getInputProps('shippingAddress.recipientName')}
      />

      {/* Teléfono */}
      <TextInput
        label="Teléfono"
        placeholder="987654321"
        required
        maxLength={9}
        {...form.getInputProps('shippingAddress.recipientPhone')}
      />

      {/* Ubigeo: Departamento, Provincia, Distrito */}
      <Group grow>
        <Select
          label="Departamento"
          placeholder="Selecciona"
          data={departments?.map((d: DepartmentResponse) => ({ value: d.id, label: d.name })) || []}
          onChange={handleDepartmentChange}
          searchable
          required
        />

        <Select
          label="Provincia"
          placeholder="Selecciona"
          data={provinces?.map((p: ProvinceResponse) => ({ value: p.id, label: p.name })) || []}
          onChange={handleProvinceChange}
          disabled={!selectedDepartment}
          searchable
          required
        />

        <Select
          label="Distrito"
          placeholder="Selecciona"
          data={districts?.map((d: DistrictResponse) => ({ value: d.id, label: d.name })) || []}
          disabled={!selectedProvince}
          searchable
          required
          value={form.values.shippingAddress.ubigeoId}
          onChange={handleDistrictChange}
        />
      </Group>

      {/* Dirección */}
      <TextInput
        label="Dirección"
        placeholder="Av. Principal 123, Urbanización Los Olivos"
        required
        {...form.getInputProps('shippingAddress.address')}
      />

      {/* Referencia */}
      <Textarea
        label="Referencia"
        placeholder="Casa de color azul, frente al parque (opcional)"
        rows={2}
        {...form.getInputProps('shippingAddress.reference')}
      />
    </Stack>
  );
};
