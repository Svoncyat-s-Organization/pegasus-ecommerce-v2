import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Grid,
  Loader,
  Center,
  Avatar,
  Divider,
  Badge,
  Tabs,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconId,
  IconEdit,
  IconMapPin,
  IconCheck,
} from '@tabler/icons-react';
import { useMyProfile, useUpdateMyProfile, useMyAddresses } from '../hooks/useProfile';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { AddressCard } from '../components/AddressCard';
import { AddressFormModal } from '../components/AddressFormModal';
import type { UpdateCustomerRequest } from '@types';

export const ProfilePage = () => {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: addresses, isLoading: addressesLoading } = useMyAddresses();
  const updateProfileMutation = useUpdateMyProfile();
  const { getPrimaryColor } = useStorefrontConfigStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  
  const primaryColor = getPrimaryColor();

  const form = useForm<UpdateCustomerRequest>({
    initialValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      docType: profile?.docType || 'DNI',
      docNumber: profile?.docNumber || '',
    },
  });

  // Update form when profile loads
  if (profile && !form.isTouched()) {
    form.setValues({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone || '',
      docType: profile.docType,
      docNumber: profile.docNumber,
    });
  }

  const handleSubmit = async (values: UpdateCustomerRequest) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      notifications.show({
        title: 'Perfil actualizado',
        message: 'Tus datos han sido actualizados correctamente',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      setIsEditing(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'No se pudo actualizar el perfil',
        color: 'red',
      });
    }
  };

  const handleAddAddress = () => {
    setEditingAddressId(null);
    setAddressModalOpen(true);
  };

  const handleEditAddress = (addressId: number) => {
    setEditingAddressId(addressId);
    setAddressModalOpen(true);
  };

  if (profileLoading) {
    return (
      <Center py={100}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!profile) {
    return (
      <Container size="md" py={60}>
        <Center>
          <Text>No se pudo cargar el perfil</Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Group gap="lg">
            <Avatar
              size={80}
              radius="xl"
              style={{ backgroundColor: primaryColor }}
            >
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </Avatar>
            <div>
              <Title order={2}>
                {profile.firstName} {profile.lastName}
              </Title>
              <Text c="dimmed">{profile.email}</Text>
              <Badge
                variant="light"
                color={profile.isActive ? 'green' : 'red'}
                mt="xs"
              >
                {profile.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
              </Badge>
            </div>
          </Group>
        </Group>

        {/* Tabs */}
        <Tabs defaultValue="personal" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="personal" leftSection={<IconUser size={16} />}>
              Datos Personales
            </Tabs.Tab>
            <Tabs.Tab value="addresses" leftSection={<IconMapPin size={16} />}>
              Direcciones
            </Tabs.Tab>
          </Tabs.List>

          {/* Personal Data Tab */}
          <Tabs.Panel value="personal" pt="xl">
            <Card withBorder radius="md" padding="lg">
              <Group justify="space-between" mb="lg">
                <Title order={4}>Información Personal</Title>
                {!isEditing && (
                  <Button
                    variant="light"
                    leftSection={<IconEdit size={16} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                )}
              </Group>

              {isEditing ? (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md">
                    <Grid gutter="md">
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput
                          label="Nombre"
                          placeholder="Tu nombre"
                          leftSection={<IconUser size={16} />}
                          {...form.getInputProps('firstName')}
                          required
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput
                          label="Apellido"
                          placeholder="Tu apellido"
                          leftSection={<IconUser size={16} />}
                          {...form.getInputProps('lastName')}
                          required
                        />
                      </Grid.Col>
                    </Grid>

                    <TextInput
                      label="Email"
                      placeholder="tu@email.com"
                      leftSection={<IconMail size={16} />}
                      {...form.getInputProps('email')}
                      required
                    />

                    <TextInput
                      label="Teléfono"
                      placeholder="987654321"
                      leftSection={<IconPhone size={16} />}
                      maxLength={9}
                      {...form.getInputProps('phone')}
                      description="9 dígitos, debe iniciar con 9"
                    />

                    <Grid gutter="md">
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Select
                          label="Tipo de Documento"
                          data={[
                            { value: 'DNI', label: 'DNI' },
                            { value: 'CE', label: 'Carné de Extranjería' },
                          ]}
                          leftSection={<IconId size={16} />}
                          {...form.getInputProps('docType')}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 8 }}>
                        <TextInput
                          label="Número de Documento"
                          placeholder={form.values.docType === 'DNI' ? '12345678' : '123456789'}
                          leftSection={<IconId size={16} />}
                          maxLength={form.values.docType === 'DNI' ? 8 : 12}
                          {...form.getInputProps('docNumber')}
                        />
                      </Grid.Col>
                    </Grid>

                    <Divider my="sm" />

                    <Group justify="flex-end" gap="sm">
                      <Button
                        variant="subtle"
                        color="gray"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        loading={updateProfileMutation.isPending}
                        style={{ backgroundColor: primaryColor }}
                      >
                        Guardar Cambios
                      </Button>
                    </Group>
                  </Stack>
                </form>
              ) : (
                <Stack gap="md">
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Text size="sm" c="dimmed">Nombre completo</Text>
                      <Text fw={500}>{profile.firstName} {profile.lastName}</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Text size="sm" c="dimmed">Email</Text>
                      <Text fw={500}>{profile.email}</Text>
                    </Grid.Col>
                  </Grid>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Text size="sm" c="dimmed">Teléfono</Text>
                      <Text fw={500}>{profile.phone ? `+51 ${profile.phone}` : 'No registrado'}</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Text size="sm" c="dimmed">Documento</Text>
                      <Text fw={500}>{profile.docType}: {profile.docNumber}</Text>
                    </Grid.Col>
                  </Grid>

                  <Divider my="xs" />

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Text size="sm" c="dimmed">Usuario</Text>
                      <Text fw={500}>@{profile.username}</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Text size="sm" c="dimmed">Miembro desde</Text>
                      <Text fw={500}>
                        {new Date(profile.createdAt).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Stack>
              )}
            </Card>
          </Tabs.Panel>

          {/* Addresses Tab */}
          <Tabs.Panel value="addresses" pt="xl">
            <Card withBorder radius="md" padding="lg">
              <Group justify="space-between" mb="lg">
                <Title order={4}>Mis Direcciones</Title>
                <Button
                  variant="light"
                  leftSection={<IconMapPin size={16} />}
                  onClick={handleAddAddress}
                >
                  Agregar Dirección
                </Button>
              </Group>

              {addressesLoading ? (
                <Center py={40}>
                  <Loader />
                </Center>
              ) : addresses && addresses.length > 0 ? (
                <Stack gap="md">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onEdit={() => handleEditAddress(address.id)}
                    />
                  ))}
                </Stack>
              ) : (
                <Center py={40}>
                  <Stack align="center" gap="sm">
                    <IconMapPin size={48} color="#adb5bd" />
                    <Text c="dimmed">No tienes direcciones registradas</Text>
                    <Button
                      variant="light"
                      onClick={handleAddAddress}
                    >
                      Agregar mi primera dirección
                    </Button>
                  </Stack>
                </Center>
              )}
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Address Modal */}
      <AddressFormModal
        opened={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        editingAddressId={editingAddressId}
        addresses={addresses || []}
      />
    </Container>
  );
};
