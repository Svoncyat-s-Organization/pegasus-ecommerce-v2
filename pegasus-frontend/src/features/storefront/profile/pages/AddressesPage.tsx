import { useState } from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Stack,
    Loader,
    Center,
    Grid,
    Group,
    ThemeIcon,
} from '@mantine/core';
import { IconMapPin, IconPlus, IconAddressBook } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useMyAddresses } from '../hooks/useProfile';
import { AddressCard } from '../components/AddressCard';
import { AddressFormModal } from '../components/AddressFormModal';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';

export const AddressesPage = () => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

    const { data: addresses, isLoading } = useMyAddresses();
    const { getPrimaryColor } = useStorefrontConfigStore();

    const primaryColor = getPrimaryColor();

    const handleEdit = (id: number) => {
        setEditingId(id);
        openModal();
    };

    const handleCreate = () => {
        setEditingId(null);
        openModal();
    };

    const handleClose = () => {
        setEditingId(null);
        closeModal();
    };

    if (isLoading) {
        return (
            <Center py={100}>
                <Loader size="lg" color={primaryColor} />
            </Center>
        );
    }

    return (
        <Container size="lg" py={40}>
            <Stack gap="xl">
                <Group justify="space-between" align="flex-end">
                    <div>
                        <Title order={2}>Mis Direcciones</Title>
                        <Text c="dimmed">Administra tus direcciones de envío y facturación</Text>
                    </div>
                    <Button
                        leftSection={<IconPlus size={18} />}
                        onClick={handleCreate}
                        style={{ backgroundColor: primaryColor }}
                        radius="md"
                    >
                        Nueva Dirección
                    </Button>
                </Group>

                {addresses && addresses.length > 0 ? (
                    <Grid gutter="lg">
                        {addresses.map((address) => (
                            <Grid.Col key={address.id} span={{ base: 12, md: 6, lg: 4 }}>
                                <AddressCard
                                    address={address}
                                    onEdit={() => handleEdit(address.id)}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                ) : (
                    <Center py={60}>
                        <Stack align="center" gap="md">
                            <ThemeIcon size={80} radius="circle" variant="light" color="gray">
                                <IconAddressBook size={48} />
                            </ThemeIcon>
                            <Title order={3} c="dimmed">No tienes direcciones guardadas</Title>
                            <Text c="dimmed" ta="center" maw={400}>
                                Agrega direcciones para agilizar tus compras.
                            </Text>
                            <Button
                                leftSection={<IconPlus size={18} />}
                                onClick={handleCreate}
                                variant="outline"
                                color="dark"
                                radius="md"
                            >
                                Agregar mi primera dirección
                            </Button>
                        </Stack>
                    </Center>
                )}
            </Stack>

            <AddressFormModal
                opened={modalOpened}
                onClose={handleClose}
                editingAddressId={editingId}
                addresses={addresses || []}
            />
        </Container>
    );
};
