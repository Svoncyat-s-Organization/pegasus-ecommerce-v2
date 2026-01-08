import { useState } from 'react';
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
  Indicator,
  Drawer,
  Stack,
  Divider,
  NavLink,
  UnstyledButton,
} from '@mantine/core';
import {
  IconSearch,
  IconShoppingCart,
  IconUser,
  IconLogout,
  IconPackage,
  IconChevronDown,
  IconHome,
  IconCategory,
  IconMapPin,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStorefrontAuthStore } from '@stores/storefront/authStore';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { useCartStore } from '@features/storefront/cart';
import { useCategories } from '@features/storefront/catalog/hooks/useCategories';
import type { CategoryResponse } from '@types';
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
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');

  const user = useStorefrontAuthStore((state) => state.user);
  const isAuthenticated = useStorefrontAuthStore((state) => state.isAuthenticated());
  const logout = useStorefrontAuthStore((state) => state.logout);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const { getStoreName, getPrimaryColor, getLogoUrl } = useStorefrontConfigStore();
  const storeName = getStoreName();
  const primaryColor = getPrimaryColor();
  const logoUrl = getLogoUrl();

  const { data: categories } = useCategories();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Main Header */}
      <Box
        style={{
          height: '100%',
          backgroundColor: '#fff',
        }}
      >
        <Container size="xl" style={{ height: '100%' }}>
          <Group justify="space-between" h="100%" gap="md">
            {/* Mobile Burger */}
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="md"
              size="sm"
            />

            {/* Logo + Store Name */}
            <UnstyledButton
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              {logoUrl ? (
                <Image src={logoSvg} alt="Logo" h={36} w="auto" />
              ) : (
                <Image src={logoUrl} alt={storeName} h={36} w="auto" fit="contain" />
              )}
              <Text
                size="lg"
                fw={700}
                style={{ color: primaryColor }}
                visibleFrom="sm"
              >
                {storeName.toUpperCase()}
              </Text>
            </UnstyledButton>

            {/* Navigation Links (Desktop) */}
            <Group gap="xs" visibleFrom="md">
              <Button
                variant={isActive('/') ? 'light' : 'subtle'}
                color="dark"
                leftSection={<IconHome size={16} />}
                onClick={() => navigate('/')}
              >
                Inicio
              </Button>

              {/* Catalog Menu */}
              <Menu trigger="hover" openDelay={100} closeDelay={200} position="bottom-start">
                <Menu.Target>
                  <Button
                    variant={location.pathname.startsWith('/products') ? 'light' : 'subtle'}
                    color="dark"
                    leftSection={<IconCategory size={16} />}
                    rightSection={<IconChevronDown size={14} />}
                  >
                    Catálogo
                  </Button>
                </Menu.Target>
                <Menu.Dropdown style={{ minWidth: 220 }}>
                  <Menu.Item onClick={() => navigate('/products')}>
                    Todos los productos
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Label>Categorías</Menu.Label>
                  {categories?.slice(0, 8).map((category: CategoryResponse) => (
                    <Menu.Item
                      key={category.id}
                      onClick={() => navigate(`/products?category=${category.id}`)}
                    >
                      {category.name}
                    </Menu.Item>
                  ))}
                  {categories && categories.length > 8 && (
                    <>
                      <Menu.Divider />
                      <Menu.Item onClick={() => navigate('/products')}>
                        Ver todas las categorías...
                      </Menu.Item>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Group>

            {/* Search Bar */}
            <Box
              style={{ flex: 1, maxWidth: 400 }}
              visibleFrom="sm"
            >
              <form onSubmit={handleSearch}>
                <TextInput
                  placeholder="Buscar productos..."
                  leftSection={<IconSearch size={16} />}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  radius="xl"
                  styles={{
                    input: {
                      border: '1px solid #e9ecef',
                      '&:focus': {
                        borderColor: primaryColor,
                      },
                    },
                  }}
                />
              </form>
            </Box>

            {/* Action Icons */}
            <Group gap="sm">
              {/* Cart */}
              <Indicator
                label={totalItems}
                size={18}
                disabled={totalItems === 0}
                color="red"
              >
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  color="dark"
                  onClick={() => navigate('/cart')}
                  title="Carrito de compras"
                >
                  <IconShoppingCart size={22} />
                </ActionIcon>
              </Indicator>

              {/* User Menu / Auth Buttons */}
              {isAuthenticated ? (
                <Menu shadow="md" width={220} position="bottom-end">
                  <Menu.Target>
                    <UnstyledButton
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: 8,
                        transition: 'background 0.2s',
                      }}
                      className="user-menu-button"
                    >
                      <Avatar
                        size="sm"
                        radius="xl"
                        color="brand"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Box visibleFrom="md">
                        <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: 100 }}>
                          {user?.email?.split('@')[0] || 'Usuario'}
                        </Text>
                      </Box>
                      <IconChevronDown size={14} />
                    </UnstyledButton>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>Mi Cuenta</Menu.Label>
                    <Menu.Item
                      leftSection={<IconUser size={16} />}
                      onClick={() => navigate('/profile')}
                    >
                      Mi Perfil
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconMapPin size={16} />}
                      onClick={() => navigate('/profile/addresses')}
                    >
                      Mis Direcciones
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconPackage size={16} />}
                      onClick={() => navigate('/orders')}
                    >
                      Mis Pedidos
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
                <Group gap="xs" visibleFrom="sm">
                  <Button
                    variant="subtle"
                    color="dark"
                    onClick={() => navigate('/login')}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="filled"
                    onClick={() => navigate('/register')}
                    style={{ backgroundColor: primaryColor }}
                  >
                    Registrarse
                  </Button>
                </Group>
              )}
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        opened={mobileOpened}
        onClose={toggleMobile}
        size="280px"
        padding="md"
        title={
          <Group gap="xs">
            {logoUrl ? (
              <Image src={logoUrl} alt={storeName} h={28} w="auto" />
            ) : (
              <Image src={logoSvg} alt="Logo" h={28} w="auto" />
            )}
            <Text fw={700} style={{ color: primaryColor }}>{storeName}</Text>
          </Group>
        }
        hiddenFrom="md"
        zIndex={1000}
      >
        <Stack gap="xs">
          {/* Mobile Search */}
          <Box component="form" onSubmit={handleSearch}>
            <TextInput
              placeholder="Buscar productos..."
              leftSection={<IconSearch size={16} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              radius="md"
            />
          </Box>

          <Divider my="sm" />

          {/* Navigation */}
          <NavLink
            label="Inicio"
            leftSection={<IconHome size={18} />}
            active={isActive('/')}
            onClick={() => {
              navigate('/');
              toggleMobile();
            }}
          />
          <NavLink
            label="Catálogo"
            leftSection={<IconCategory size={18} />}
            active={location.pathname.startsWith('/products')}
            onClick={() => {
              navigate('/products');
              toggleMobile();
            }}
          />

          {/* Categories */}
          {categories && categories.length > 0 && (
            <>
              <Text size="xs" c="dimmed" mt="sm" mb="xs" tt="uppercase" fw={600}>
                Categorías
              </Text>
              {categories.slice(0, 6).map((category: CategoryResponse) => (
                <NavLink
                  key={category.id}
                  label={category.name}
                  pl="md"
                  onClick={() => {
                    navigate(`/products?category=${category.id}`);
                    toggleMobile();
                  }}
                />
              ))}
            </>
          )}

          <Divider my="sm" />

          {/* User Section */}
          {isAuthenticated ? (
            <>
              <NavLink
                label="Mi Perfil"
                leftSection={<IconUser size={18} />}
                onClick={() => {
                  navigate('/profile');
                  toggleMobile();
                }}
              />
              <NavLink
                label="Mis Pedidos"
                leftSection={<IconPackage size={18} />}
                onClick={() => {
                  navigate('/orders');
                  toggleMobile();
                }}
              />
              <NavLink
                label="Cerrar Sesión"
                leftSection={<IconLogout size={18} />}
                color="red"
                onClick={() => {
                  handleLogout();
                  toggleMobile();
                }}
              />
            </>
          ) : (
            <Stack gap="xs" mt="sm">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  navigate('/login');
                  toggleMobile();
                }}
              >
                Iniciar Sesión
              </Button>
              <Button
                fullWidth
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  navigate('/register');
                  toggleMobile();
                }}
              >
                Registrarse
              </Button>
            </Stack>
          )}
        </Stack>
      </Drawer>
    </>
  );
};
