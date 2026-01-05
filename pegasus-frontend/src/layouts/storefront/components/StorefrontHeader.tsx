import {
  Group,
  Button,
  TextInput,
  ActionIcon,
  Menu,
  Avatar,
  Text,
  Burger,
  Container,
  Box,
  Image,
} from '@mantine/core';
import {
  IconSearch,
  IconShoppingCart,
  IconUser,
  IconHeart,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useStorefrontAuthStore } from '@stores/storefront/authStore';
import logoSvg from '@assets/logo/default.svg';

interface StorefrontHeaderProps {
  mobileOpened: boolean;
  toggleMobile: () => void;
}

export const StorefrontHeader = ({
  mobileOpened,
  toggleMobile,
}: StorefrontHeaderProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useStorefrontAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      style={{
        height: '100%',
        borderBottom: '1px solid #e9ecef',
        backgroundColor: '#fff',
      }}
    >
      <Container size="xl" style={{ height: '100%' }}>
        <Group justify="space-between" h="100%">
          {/* Logo */}
          <Group gap="xs">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Group
              gap={8}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Text size="xl" fw={700} c="dark">
                PEGASUS
              </Text>
              <Image src={logoSvg} alt="Pegasus Logo" h={28} w="auto" />
              <Text size="xl" fw={700} c="dark">
                E-COMMERCE
              </Text>
            </Group>
          </Group>

          {/* Search */}
          <TextInput
            placeholder="Buscar productos..."
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1, maxWidth: 500 }}
            visibleFrom="sm"
          />

          {/* Actions */}
          <Group gap="md">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => navigate('/favorites')}
            >
              <IconHeart size={20} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => navigate('/cart')}
            >
              <IconShoppingCart size={20} />
            </ActionIcon>

            {isAuthenticated ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg">
                    <Avatar size="sm" color="blue">
                      <IconUser size={16} />
                    </Avatar>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{user?.email}</Menu.Label>
                  <Menu.Item
                    leftSection={<IconUser size={16} />}
                    onClick={() => navigate('/profile')}
                  >
                    Mi Perfil
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconSettings size={16} />}
                    onClick={() => navigate('/settings')}
                  >
                    Configuración
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <>
                <Button
                  variant="subtle"
                  onClick={() => navigate('/login')}
                  visibleFrom="sm"
                >
                  Iniciar Sesión
                </Button>
                <Button onClick={() => navigate('/register')} visibleFrom="sm">
                  Registrarse
                </Button>
              </>
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
};
