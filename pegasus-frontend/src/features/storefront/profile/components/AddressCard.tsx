import {
  Card,
  Group,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Menu,
} from '@mantine/core';
import {
  IconMapPin,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconTruck,
  IconReceipt,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import type { CustomerAddressResponse } from '@types';
import {
  useDeleteMyAddress,
  useSetDefaultShipping,
  useSetDefaultBilling,
} from '../hooks/useProfile';

interface AddressCardProps {
  address: CustomerAddressResponse;
  onEdit: () => void;
}

export const AddressCard = ({ address, onEdit }: AddressCardProps) => {
  const deleteAddressMutation = useDeleteMyAddress();
  const setDefaultShippingMutation = useSetDefaultShipping();
  const setDefaultBillingMutation = useSetDefaultBilling();

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Eliminar Dirección',
      children: (
        <Text size="sm">
          ¿Estás seguro de que deseas eliminar esta dirección?
          Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteAddressMutation.mutateAsync(address.id);
          notifications.show({
            title: 'Dirección eliminada',
            message: 'La dirección ha sido eliminada correctamente',
            color: 'green',
          });
        } catch {
          notifications.show({
            title: 'Error',
            message: 'No se pudo eliminar la dirección',
            color: 'red',
          });
        }
      },
    });
  };

  const handleSetDefaultShipping = async () => {
    try {
      await setDefaultShippingMutation.mutateAsync(address.id);
      notifications.show({
        title: 'Dirección de envío actualizada',
        message: 'Esta dirección es ahora tu dirección de envío predeterminada',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'No se pudo establecer la dirección de envío',
        color: 'red',
      });
    }
  };

  const handleSetDefaultBilling = async () => {
    try {
      await setDefaultBillingMutation.mutateAsync(address.id);
      notifications.show({
        title: 'Dirección de facturación actualizada',
        message: 'Esta dirección es ahora tu dirección de facturación predeterminada',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'No se pudo establecer la dirección de facturación',
        color: 'red',
      });
    }
  };

  return (
    <Card withBorder radius="md" padding="md" style={{ backgroundColor: '#fafafa' }}>
      <Group justify="space-between" align="flex-start">
        <Group gap="md" align="flex-start" wrap="nowrap">
          <IconMapPin size={24} style={{ color: '#868e96', flexShrink: 0, marginTop: 2 }} />
          <Stack gap={4}>
            <Text fw={500} lineClamp={2}>{address.address}</Text>
            {address.reference && (
              <Text size="sm" c="dimmed">Ref: {address.reference}</Text>
            )}
            <Text size="sm" c="dimmed">Ubigeo: {address.ubigeoId}</Text>
            {address.postalCode && (
              <Text size="sm" c="dimmed">CP: {address.postalCode}</Text>
            )}
            <Group gap="xs" mt="xs">
              {address.isDefaultShipping && (
                <Badge variant="light" color="blue" size="sm" leftSection={<IconTruck size={12} />}>
                  Envío
                </Badge>
              )}
              {address.isDefaultBilling && (
                <Badge variant="light" color="green" size="sm" leftSection={<IconReceipt size={12} />}>
                  Facturación
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>

        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={16} />}
              onClick={onEdit}
            >
              Editar
            </Menu.Item>
            {!address.isDefaultShipping && (
              <Menu.Item
                leftSection={<IconTruck size={16} />}
                onClick={handleSetDefaultShipping}
              >
                Usar para envíos
              </Menu.Item>
            )}
            {!address.isDefaultBilling && (
              <Menu.Item
                leftSection={<IconReceipt size={16} />}
                onClick={handleSetDefaultBilling}
              >
                Usar para facturación
              </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={handleDelete}
            >
              Eliminar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
};
