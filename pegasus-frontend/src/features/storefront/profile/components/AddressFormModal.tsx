import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Grid,
  Select,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';
import { useCreateMyAddress, useUpdateMyAddress } from '../hooks/useProfile';
import type { CustomerAddressResponse, CreateCustomerAddressRequest, UpdateCustomerAddressRequest } from '@types';

interface AddressFormModalProps {
  opened: boolean;
  onClose: () => void;
  editingAddressId: number | null;
  addresses: CustomerAddressResponse[];
}

export const AddressFormModal = ({
  opened,
  onClose,
  editingAddressId,
  addresses,
}: AddressFormModalProps) => {
  const createAddressMutation = useCreateMyAddress();
  const updateAddressMutation = useUpdateMyAddress();

  const editingAddress = editingAddressId
    ? addresses.find((a) => a.id === editingAddressId)
    : null;

  const form = useForm({
    initialValues: {
      address: '',
      reference: '',
      postalCode: '',
      departmentId: '',
      provinceId: '',
      districtId: '',
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
  });

  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(form.values.departmentId || undefined);
  const { data: districts } = useDistricts(form.values.provinceId || undefined);

  // Populate form when editing
  useEffect(() => {
    if (opened && editingAddress) {
      // Parse ubigeo to get department and province
      const deptId = editingAddress.ubigeoId.substring(0, 2);
      const provId = editingAddress.ubigeoId.substring(0, 4);
      
      form.setValues({
        address: editingAddress.address,
        reference: editingAddress.reference || '',
        postalCode: editingAddress.postalCode || '',
        departmentId: deptId,
        provinceId: provId,
        districtId: editingAddress.ubigeoId,
        isDefaultShipping: editingAddress.isDefaultShipping,
        isDefaultBilling: editingAddress.isDefaultBilling,
      });
    } else if (opened) {
      form.reset();
    }
  }, [opened, editingAddress]);

  const handleSubmit = async () => {
    if (!form.values.districtId) {
      notifications.show({
        title: 'Error',
        message: 'Debe seleccionar un distrito',
        color: 'red',
      });
      return;
    }

    try {
      if (editingAddressId) {
        const request: UpdateCustomerAddressRequest = {
          address: form.values.address,
          reference: form.values.reference || undefined,
          postalCode: form.values.postalCode || undefined,
          ubigeoId: form.values.districtId,
        };
        await updateAddressMutation.mutateAsync({ addressId: editingAddressId, request });
        notifications.show({
          title: 'Dirección actualizada',
          message: 'La dirección ha sido actualizada correctamente',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        const request: CreateCustomerAddressRequest = {
          address: form.values.address,
          reference: form.values.reference || undefined,
          postalCode: form.values.postalCode || undefined,
          ubigeoId: form.values.districtId,
          isDefaultShipping: form.values.isDefaultShipping,
          isDefaultBilling: form.values.isDefaultBilling,
        };
        await createAddressMutation.mutateAsync(request);
        notifications.show({
          title: 'Dirección creada',
          message: 'La nueva dirección ha sido agregada',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'No se pudo guardar la dirección',
        color: 'red',
      });
    }
  };

  const isLoading = createAddressMutation.isPending || updateAddressMutation.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingAddressId ? 'Editar Dirección' : 'Nueva Dirección'}
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Dirección"
          placeholder="Av. Principal 123, Dpto. 456"
          required
          {...form.getInputProps('address')}
        />

        <Textarea
          label="Referencia"
          placeholder="Cerca de..."
          rows={2}
          {...form.getInputProps('reference')}
        />

        <Grid gutter="md">
          <Grid.Col span={4}>
            <Select
              label="Departamento"
              placeholder="Seleccionar"
              data={
                departments?.map((d) => ({
                  value: d.id,
                  label: d.name,
                })) || []
              }
              value={form.values.departmentId}
              onChange={(value) => {
                form.setFieldValue('departmentId', value || '');
                form.setFieldValue('provinceId', '');
                form.setFieldValue('districtId', '');
              }}
              searchable
              required
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Provincia"
              placeholder="Seleccionar"
              data={
                provinces?.map((p) => ({
                  value: p.id,
                  label: p.name,
                })) || []
              }
              value={form.values.provinceId}
              onChange={(value) => {
                form.setFieldValue('provinceId', value || '');
                form.setFieldValue('districtId', '');
              }}
              searchable
              required
              disabled={!form.values.departmentId}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Distrito"
              placeholder="Seleccionar"
              data={
                districts?.map((d) => ({
                  value: d.id,
                  label: d.name,
                })) || []
              }
              value={form.values.districtId}
              onChange={(value) => form.setFieldValue('districtId', value || '')}
              searchable
              required
              disabled={!form.values.provinceId}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Código Postal"
          placeholder="15001"
          maxLength={10}
          {...form.getInputProps('postalCode')}
        />

        {!editingAddressId && (
          <Group gap="xl">
            <Checkbox
              label="Usar como dirección de envío"
              {...form.getInputProps('isDefaultShipping', { type: 'checkbox' })}
            />
            <Checkbox
              label="Usar como dirección de facturación"
              {...form.getInputProps('isDefaultBilling', { type: 'checkbox' })}
            />
          </Group>
        )}

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {editingAddressId ? 'Guardar Cambios' : 'Agregar Dirección'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
