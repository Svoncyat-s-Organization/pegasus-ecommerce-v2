import {
  Container,
  Group,
  Text,
  Anchor,
  Stack,
  Box,
  Grid,
  ActionIcon,
  Image,
} from '@mantine/core';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconMail,
  IconPhone,
  IconMapPin,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import logoSvg from '@assets/logo/default.svg';

export const StorefrontFooter = () => {
  const navigate = useNavigate();
  const { settings, businessInfo, getStoreName, getLogoUrl } = useStorefrontConfigStore();
  
  const storeName = getStoreName();
  const logoUrl = getLogoUrl();

  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: '#1a1a2e',
        color: '#fff',
        marginTop: 'auto',
      }}
    >
      {/* Main Footer Content */}
      <Container size="xl" py={48}>
        <Grid gutter={40}>
          {/* Company Info */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="md">
              <Group gap="xs">
                {logoUrl ? (
                  <Image src={logoSvg} alt="Logo" h={32} w="auto" style={{ filter: 'brightness(0) invert(1)' }} />
                ) : (
                  <Image src={logoUrl} alt={storeName} h={32} w="auto" style={{ filter: 'brightness(0) invert(1)' }} />
                )}
                <Text size="lg" fw={700}>{storeName.toUpperCase()}</Text>
              </Group>
              {businessInfo?.businessDescription && (
                <Text size="sm" c="gray.4" lineClamp={3}>
                  {businessInfo.businessDescription}
                </Text>
              )}
              {/* Social Media */}
              <Group gap="xs" mt="xs">
                {businessInfo?.facebookUrl && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="xl"
                    component="a"
                    href={businessInfo.facebookUrl}
                    target="_blank"
                    title="Facebook"
                  >
                    <IconBrandFacebook size={20} />
                  </ActionIcon>
                )}
                {businessInfo?.instagramUrl && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="xl"
                    component="a"
                    href={businessInfo.instagramUrl}
                    target="_blank"
                    title="Instagram"
                  >
                    <IconBrandInstagram size={20} />
                  </ActionIcon>
                )}
                {businessInfo?.twitterUrl && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="xl"
                    component="a"
                    href={businessInfo.twitterUrl}
                    target="_blank"
                    title="Twitter"
                  >
                    <IconBrandTwitter size={20} />
                  </ActionIcon>
                )}
                {businessInfo?.tiktokUrl && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="xl"
                    component="a"
                    href={businessInfo.tiktokUrl}
                    target="_blank"
                    title="TikTok"
                  >
                    <IconBrandTiktok size={20} />
                  </ActionIcon>
                )}
                {settings?.whatsappNumber && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="xl"
                    component="a"
                    href={`https://wa.me/51${settings.whatsappNumber}`}
                    target="_blank"
                    title="WhatsApp"
                  >
                    <IconBrandWhatsapp size={20} />
                  </ActionIcon>
                )}
              </Group>
            </Stack>
          </Grid.Col>

          {/* Quick Links */}
          <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
            <Stack gap="xs">
              <Text size="sm" fw={600} tt="uppercase" c="gray.3">
                Tienda
              </Text>
              <Anchor
                size="sm"
                c="gray.4"
                onClick={() => navigate('/')}
                underline="hover"
                style={{ cursor: 'pointer' }}
              >
                Inicio
              </Anchor>
              <Anchor
                size="sm"
                c="gray.4"
                onClick={() => navigate('/products')}
                underline="hover"
                style={{ cursor: 'pointer' }}
              >
                Catálogo
              </Anchor>
              <Anchor
                size="sm"
                c="gray.4"
                onClick={() => navigate('/products?featured=true')}
                underline="hover"
                style={{ cursor: 'pointer' }}
              >
                Destacados
              </Anchor>
            </Stack>
          </Grid.Col>

          {/* Account Links */}
          <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
            <Stack gap="xs">
              <Text size="sm" fw={600} tt="uppercase" c="gray.3">
                Mi Cuenta
              </Text>
              <Anchor
                size="sm"
                c="gray.4"
                onClick={() => navigate('/profile')}
                underline="hover"
                style={{ cursor: 'pointer' }}
              >
                Mi Perfil
              </Anchor>
              <Anchor
                size="sm"
                c="gray.4"
                onClick={() => navigate('/orders')}
                underline="hover"
                style={{ cursor: 'pointer' }}
              >
                Mis Pedidos
              </Anchor>
              <Anchor
                size="sm"
                c="gray.4"
                onClick={() => navigate('/cart')}
                underline="hover"
                style={{ cursor: 'pointer' }}
              >
                Carrito
              </Anchor>
            </Stack>
          </Grid.Col>

          {/* Legal Links */}
          <Grid.Col span={{ base: 6, sm: 6, md: 2 }}>
            <Stack gap="xs">
              <Text size="sm" fw={600} tt="uppercase" c="gray.3">
                Legal
              </Text>
              {settings?.termsAndConditions && (
                <Anchor
                  size="sm"
                  c="gray.4"
                  onClick={() => navigate('/legal/terms')}
                  underline="hover"
                  style={{ cursor: 'pointer' }}
                >
                  Términos y Condiciones
                </Anchor>
              )}
              {settings?.privacyPolicy && (
                <Anchor
                  size="sm"
                  c="gray.4"
                  onClick={() => navigate('/legal/privacy')}
                  underline="hover"
                  style={{ cursor: 'pointer' }}
                >
                  Política de Privacidad
                </Anchor>
              )}
              {settings?.returnPolicy && (
                <Anchor
                  size="sm"
                  c="gray.4"
                  onClick={() => navigate('/legal/returns')}
                  underline="hover"
                  style={{ cursor: 'pointer' }}
                >
                  Política de Devoluciones
                </Anchor>
              )}
              {settings?.shippingPolicy && (
                <Anchor
                  size="sm"
                  c="gray.4"
                  onClick={() => navigate('/legal/shipping')}
                  underline="hover"
                  style={{ cursor: 'pointer' }}
                >
                  Política de Envíos
                </Anchor>
              )}
            </Stack>
          </Grid.Col>

          {/* Contact Info */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="xs">
              <Text size="sm" fw={600} tt="uppercase" c="gray.3">
                Contacto
              </Text>
              {(settings?.supportEmail || businessInfo?.email) && (
                <Group gap="xs" wrap="nowrap">
                  <IconMail size={16} style={{ color: '#868e96', flexShrink: 0 }} />
                  <Text size="sm" c="gray.4">
                    {settings?.supportEmail || businessInfo?.email}
                  </Text>
                </Group>
              )}
              {(settings?.supportPhone || businessInfo?.phone) && (
                <Group gap="xs" wrap="nowrap">
                  <IconPhone size={16} style={{ color: '#868e96', flexShrink: 0 }} />
                  <Text size="sm" c="gray.4">
                    +51 {settings?.supportPhone || businessInfo?.phone}
                  </Text>
                </Group>
              )}
              {businessInfo?.legalAddress && (
                <Group gap="xs" wrap="nowrap" align="flex-start">
                  <IconMapPin size={16} style={{ color: '#868e96', flexShrink: 0, marginTop: 2 }} />
                  <Text size="sm" c="gray.4" lineClamp={2}>
                    {businessInfo.legalAddress}
                  </Text>
                </Group>
              )}
              {businessInfo?.ruc && (
                <Text size="xs" c="gray.5" mt="xs">
                  RUC: {businessInfo.ruc}
                </Text>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Bottom Bar */}
      <Box style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Container size="xl" py="md">
          <Group justify="space-between" align="center">
            <Text size="xs" c="gray.5">
              © {currentYear} {businessInfo?.businessName || storeName}. Todos los derechos reservados.
            </Text>
            <Group gap="md" visibleFrom="sm">
              <Anchor
                size="xs"
                c="gray.5"
                onClick={() => navigate('/contact')}
                underline="hover"
                style={{ cursor: 'pointer' }}
              >
                Contacto
              </Anchor>
              <Anchor
                size="xs"
                c="gray.5"
                href={businessInfo?.website || '#'}
                target="_blank"
                underline="hover"
              >
                Sitio Web
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
};
