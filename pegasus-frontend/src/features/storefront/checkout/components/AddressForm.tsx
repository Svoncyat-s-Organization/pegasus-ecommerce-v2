import { Stack, TextInput, Textarea, Select, Group, Card, Text, Badge, Radio, Button, Divider, Box, Collapse } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useState } from 'react';
import { IconPlus, IconMapPin, IconCheck } from '@tabler/icons-react';
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';
import type { DepartmentResponse, ProvinceResponse, DistrictResponse } from '@shared/api/locationsApi';
import type { CheckoutFormValues } from '../types/checkout.types';
import { useMyAddresses } from '@features/storefront/profile';
import { useStorefrontAuthStore } from '@stores/storefront/authStore';

interface AddressFormProps {
  form: UseFormReturnType<CheckoutFormValues>;
}

/**
 * AddressForm Component
 * Formulario para ingresar dirección de envío con ubigeo (Perú)
 * Permite seleccionar de direcciones guardadas o crear una nueva
 */
export const AddressForm = ({ form }: AddressFormProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>();
  const [selectedProvince, setSelectedProvince] = useState<string>();
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('saved');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const { isAuthenticated } = useStorefrontAuthStore();
  const { data: savedAddresses } = useMyAddresses();
  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(selectedDepartment);
  const { data: districts } = useDistricts(selectedProvince);

  const hasSavedAddresses = savedAddresses && savedAddresses.length > 0;

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

  const handleSavedAddressSelect = (addressId: number) => {
    const address = savedAddresses?.find((a) => a.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      form.setFieldValue('shippingAddress', {
        recipientName: '',
        recipientPhone: '',
        address: address.address,
        reference: address.reference || '',
        ubigeoId: address.ubigeoId,
        districtName: '',
        provinceName: '',
        departmentName: '',
      });
    }
  };

  return (
    <Stack gap="lg">
      {/* Saved Addresses Section (only for authenticated users) */}
      {isAuthenticated() && hasSavedAddresses && (
        <>
          <Box>
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Mis direcciones guardadas</Text>
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() => {
                  setAddressMode('new');
                  setSelectedAddressId(null);
                }}
              >
                Nueva dirección
              </Button>
            </Group>

            <Radio.Group
              value={selectedAddressId?.toString() || ''}
              onChange={(value) => {
                setAddressMode('saved');
                handleSavedAddressSelect(Number(value));
              }}
            >
              <Stack gap="sm">
                {savedAddresses.map((addr) => (
                  <Card
                    key={addr.id}
                    withBorder
                    radius="md"
                    padding="md"
                    style={{
                      cursor: 'pointer',
                      borderColor: selectedAddressId === addr.id ? 'var(--mantine-color-blue-6)' : undefined,
                      borderWidth: selectedAddressId === addr.id ? 2 : 1,
                    }}
                    onClick={() => handleSavedAddressSelect(addr.id)}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <Radio value={addr.id.toString()} />
                        <div>
                          <Group gap="xs" mb={4}>
                            <IconMapPin size={16} color="#868e96" />
                            <Text size="sm" fw={500}>
                              {addr.address}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            Ubigeo: {addr.ubigeoId}
                          </Text>
                          {addr.reference && (
                            <Text size="xs" c="dimmed">
                              Ref: {addr.reference}
                            </Text>
                          )}
                        </div>
                      </Group>
                      <Stack gap={4}>
                        {addr.isDefaultShipping && (
                          <Badge size="xs" color="blue" variant="light">
                            Envío
                          </Badge>
                        )}
                        {addr.isDefaultBilling && (
                          <Badge size="xs" color="grape" variant="light">
                            Facturación
                          </Badge>
                        )}
                      </Stack>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Radio.Group>
          </Box>

          <Divider
            label={
              <Group gap="xs">
                <IconPlus size={14} />
                <Text size="sm">O ingresa una nueva dirección</Text>
              </Group>
            }
            labelPosition="center"
          />
        </>
      )}

      {/* New Address Form */}
      <Collapse in={addressMode === 'new' || !hasSavedAddresses || !isAuthenticated}>
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
            leftSection={<Text size="sm" c="dimmed">+51</Text>}
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
            leftSection={<IconMapPin size={16} />}
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
      </Collapse>

      {/* Show selected address when using saved */}
      {addressMode === 'saved' && selectedAddressId && (
        <Card withBorder radius="md" padding="md" bg="blue.0">
          <Group gap="xs" mb="xs">
            <IconCheck size={18} color="var(--mantine-color-blue-6)" />
            <Text size="sm" fw={600} c="blue">
              Dirección seleccionada
            </Text>
          </Group>
          <Text size="sm">{form.values.shippingAddress.address}</Text>
          <Text size="xs" c="dimmed">
            {form.values.shippingAddress.districtName}, {form.values.shippingAddress.provinceName},{' '}
            {form.values.shippingAddress.departmentName}
          </Text>
        </Card>
      )}
    </Stack>
  );
};
