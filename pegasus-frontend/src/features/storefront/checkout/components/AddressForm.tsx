import { Stack, TextInput, Textarea, Select, Group, Card, Text, Badge, Radio, Button, Divider, Box, Collapse } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useState, useEffect } from 'react';
import { IconPlus, IconMapPin, IconCheck } from '@tabler/icons-react';
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';
import type { DepartmentResponse, ProvinceResponse, DistrictResponse } from '@shared/api/locationsApi';
import type { CheckoutFormValues } from '../types/checkout.types';
import { useMyAddresses, useMyProfile } from '@features/storefront/profile';
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
  const { data: profile } = useMyProfile();

  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(selectedDepartment);
  const { data: districts } = useDistricts(selectedProvince);

  const hasSavedAddresses = savedAddresses && savedAddresses.length > 0;

  // Pre-fill recipient info from profile if empty
  useEffect(() => {
    if (profile && !form.values.shippingAddress.recipientName) {
      form.setFieldValue('shippingAddress.recipientName', `${profile.firstName} ${profile.lastName}`);
    }
    if (profile?.phone && !form.values.shippingAddress.recipientPhone) {
      form.setFieldValue('shippingAddress.recipientPhone', profile.phone);
    }
  }, [profile]);

  // If no saved addresses, switch to new mode
  useEffect(() => {
    if (savedAddresses && savedAddresses.length === 0) {
      setAddressMode('new');
    }
  }, [savedAddresses]);

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
      form.setFieldValue('shippingAddress.address', address.address);
      form.setFieldValue('shippingAddress.reference', address.reference || '');
      form.setFieldValue('shippingAddress.ubigeoId', address.ubigeoId);

      // Note: We don't have location names here (departmentName, etc) from the simple address object.
      // They might be missing in the summary step, but the ID is what matters for backend.
    }
  };

  return (
    <Stack gap="lg">
      {/* Saved Addresses Section */}
      {isAuthenticated() && hasSavedAddresses && (
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
                // Clear address fields but keep recipient
                form.setFieldValue('shippingAddress.address', '');
                form.setFieldValue('shippingAddress.reference', '');
                form.setFieldValue('shippingAddress.ubigeoId', '');
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
                    backgroundColor: selectedAddressId === addr.id ? 'var(--mantine-color-blue-0)' : undefined,
                  }}
                  onClick={() => {
                    setAddressMode('saved');
                    handleSavedAddressSelect(addr.id);
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Radio value={addr.id.toString()} style={{ cursor: 'pointer' }} />
                      <div>
                        <Group gap="xs" mb={4}>
                          <IconMapPin size={16} color="#868e96" />
                          <Text size="sm" fw={500}>
                            {addr.address}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {/* We don't have resolved names here, so just show " Ubigeo: ..." */}
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
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Radio.Group>
        </Box>
      )}

      {hasSavedAddresses && <Divider />}

      {/* Common Fields: Recipient Info (ALWAYS VISIBLE) */}
      <Box>
        <Text fw={600} mb="xs">Datos de Contacto</Text>
        <Group grow>
          <TextInput
            label="Nombre del destinatario"
            placeholder="Juan Pérez García"
            required
            {...form.getInputProps('shippingAddress.recipientName')}
          />

          <TextInput
            label="Teléfono"
            placeholder="987654321"
            required
            maxLength={9}
            leftSection={<Text size="sm" c="dimmed">+51</Text>}
            {...form.getInputProps('shippingAddress.recipientPhone')}
          />
        </Group>
      </Box>

      {/* New Address Location Fields (Hidden if using saved address) */}
      <Collapse in={addressMode === 'new'}>
        <Stack gap="md">
          <Text fw={600}>Detalles de Ubicación</Text>
          {/* Ubigeo: Departamento, Provincia, Distrito */}
          <Group grow>
            <Select
              label="Departamento"
              placeholder="Selecciona"
              data={departments?.map((d: DepartmentResponse) => ({ value: d.id, label: d.name })) || []}
              onChange={handleDepartmentChange}
              searchable
              required={addressMode === 'new'}
            />

            <Select
              label="Provincia"
              placeholder="Selecciona"
              data={provinces?.map((p: ProvinceResponse) => ({ value: p.id, label: p.name })) || []}
              onChange={handleProvinceChange}
              disabled={!selectedDepartment}
              searchable
              required={addressMode === 'new'}
            />

            <Select
              label="Distrito"
              placeholder="Selecciona"
              data={districts?.map((d: DistrictResponse) => ({ value: d.id, label: d.name })) || []}
              disabled={!selectedProvince}
              searchable
              required={addressMode === 'new'}
              value={form.values.shippingAddress.ubigeoId}
              onChange={handleDistrictChange}
            />
          </Group>

          {/* Dirección */}
          <TextInput
            label="Dirección"
            placeholder="Av. Principal 123, Urbanización Los Olivos"
            required={addressMode === 'new'}
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

      {/* Show summary of saved address selection if mode is saved */}
      {addressMode === 'saved' && selectedAddressId && (
        <Card withBorder radius="md" padding="md" bg="gray.1">
          <Group gap="xs">
            <IconCheck size={18} color="green" />
            <Text size="sm" c="dimmed">
              Usando dirección guardada: <b>{form.values.shippingAddress.address}</b>
            </Text>
          </Group>
        </Card>
      )}
    </Stack>
  );
};
