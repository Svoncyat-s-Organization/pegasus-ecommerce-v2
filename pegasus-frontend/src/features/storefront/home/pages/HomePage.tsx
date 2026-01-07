import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Grid,
  Card,
  ThemeIcon,
  SimpleGrid,
  Image,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconTruck,
  IconShieldCheck,
  IconCreditCard,
  IconArrowRight,
} from '@tabler/icons-react';
import { useFeaturedProducts } from '@features/storefront/catalog';
import { ProductGrid } from '@features/storefront/catalog/components/ProductGrid';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { useCategories } from '@features/storefront/catalog/hooks/useCategories';
import { useBrands } from '@features/storefront/catalog/hooks/useBrands';
import type { BrandResponse, CategoryResponse } from '@types';
import logoSvg from '@assets/logo/inverted.svg';

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: featuredProducts, isLoading } = useFeaturedProducts(0, 8);
  const { getPrimaryColor, getStoreName } = useStorefrontConfigStore();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const primaryColor = getPrimaryColor();
  const storeName = getStoreName();

  const features = [
    {
      icon: IconTruck,
      title: 'Envío a todo el Perú',
      description: 'Llegamos a todos los departamentos del país',
    },
    {
      icon: IconShieldCheck,
      title: 'Compra Segura',
      description: 'Tus datos están protegidos en todo momento',
    },
    {
      icon: IconCreditCard,
      title: 'Pago Fácil',
      description: 'Múltiples métodos de pago disponibles',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -0.3)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />
        
        <Container size="xl" py={80} style={{ position: 'relative', zIndex: 1 }}>
          <Grid align="center" gutter={60}>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="xl">
                <Box>
                  <Text
                    size="sm"
                    tt="uppercase"
                    fw={600}
                    c="white"
                    style={{ opacity: 0.8, letterSpacing: 2 }}
                    mb="xs"
                  >
                    Bienvenido a {storeName}
                  </Text>
                  <Title
                    order={1}
                    size={52}
                    c="white"
                    style={{ lineHeight: 1.2 }}
                  >
                    Tu tienda online de{' '}
                    <Text
                      component="span"
                      inherit
                      style={{
                        background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      confianza
                    </Text>{' '}
                    en Perú
                  </Title>
                </Box>
                
                <Text size="lg" c="white" style={{ opacity: 0.9, maxWidth: 500 }}>
                  Descubre nuestra amplia selección de productos con los mejores precios
                  y la mejor calidad. Envíos a todo el país.
                </Text>

                <Group gap="md">
                  <Button
                    size="lg"
                    variant="white"
                    color="dark"
                    radius="xl"
                    rightSection={<IconArrowRight size={18} />}
                    onClick={() => navigate('/products')}
                    styles={{
                      root: {
                        fontWeight: 600,
                        paddingLeft: 28,
                        paddingRight: 24,
                      },
                    }}
                  >
                    Ver Catálogo
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    color="white"
                    radius="xl"
                    onClick={() => navigate('/products?featured=true')}
                    styles={{
                      root: {
                        borderWidth: 2,
                        fontWeight: 600,
                        paddingLeft: 28,
                        paddingRight: 28,
                      },
                    }}
                  >
                    Destacados
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 5 }} visibleFrom="md">
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 320,
                }}
              >
                <Image
                  src={logoSvg}
                  alt={`${storeName} logo`}
                  fit="contain"
                  h={220}
                  w={320}
                />
                <Title
                  order={2}
                  size={52}
                  tt="uppercase"
                  mt="md"
                  style={{ lineHeight: 1, letterSpacing: 4 }}
                >
                  <Text
                    component="span"
                    inherit
                    style={{
                      background:
                        'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    PEGASUS
                  </Text>
                </Title>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box bg="white" py={40} style={{ display: 'flex', justifyContent: 'center' }}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={50}>
            {features.map((feature) => (
              <Group key={feature.title} gap="md" wrap="nowrap">
                <ThemeIcon
                  size={48}
                  radius="md"
                  variant="light"
                  color="brand"
                >
                  <feature.icon size={24} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={600}>
                    {feature.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {feature.description}
                  </Text>
                </Box>
              </Group>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Container size="xl" py={60}>
        <Stack gap="xl">
          <Group justify="space-between" align="flex-end">
            <Box>
              <Text
                size="xs"
                tt="uppercase"
                fw={600}
                c={primaryColor}
                style={{ letterSpacing: 1 }}
                mb={4}
              >
                Lo más popular
              </Text>
              <Title order={2} size={32}>
                Productos Destacados
              </Title>
              <Text c="dimmed" mt={4}>
                Descubre nuestros productos más vendidos y mejor valorados
              </Text>
            </Box>
            <Button
              variant="subtle"
              rightSection={<IconArrowRight size={16} />}
              onClick={() => navigate('/products?featured=true')}
            >
              Ver todos
            </Button>
          </Group>

          <ProductGrid
            products={featuredProducts?.content || []}
            isLoading={isLoading}
          />
        </Stack>
      </Container>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <Box bg="white" py={60}>
          <Container size="xl">
            <Stack gap="xl">
              <Box ta="center">
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c={primaryColor}
                  style={{ letterSpacing: 1 }}
                  mb={4}
                >
                  Explora por categoría
                </Text>
                <Title order={2} size={32}>
                  Nuestras Categorías
                </Title>
              </Box>

              <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 6 }} spacing="md">
                {categories.slice(0, 6).map((category: CategoryResponse) => (
                  <Card
                    key={category.id}
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                    onClick={() => navigate(`/products?categoryIds=${category.id}`)}
                    className="category-card"
                  >
                    <Stack gap="xs" align="center">
                      {category.imageUrl ? (
                        <Box
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            src={category.imageUrl}
                            alt={category.name}
                            fit="cover"
                            h={80}
                            w={80}
                          />
                        </Box>
                      ) : (
                        <Box
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text size="xl" fw={700} c={primaryColor}>
                            {category.name.charAt(0)}
                          </Text>
                        </Box>
                      )}
                      <Text size="sm" fw={500}>
                        {category.name}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>

              <Box ta="center">
                <Button
                  variant="outline"
                  radius="xl"
                  onClick={() => navigate('/products')}
                >
                  Ver todas las categorías
                </Button>
              </Box>

              {brands && brands.length > 0 && (
                <>
                  <Box ta="center" mt="xl">
                    <Text
                      size="xs"
                      tt="uppercase"
                      fw={600}
                      c={primaryColor}
                      style={{ letterSpacing: 1 }}
                      mb={4}
                    >
                      Explora por marca
                    </Text>
                    <Title order={3} size={28}>
                      Nuestras Marcas
                    </Title>
                  </Box>

                  <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 6 }} spacing="md">
                    {brands.map((brand: BrandResponse) => (
                      <Card
                        key={brand.id}
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                        }}
                        onClick={() => navigate(`/products?brandIds=${brand.id}`)}
                      >
                        <Stack gap="xs" align="center">
                          {brand.imageUrl ? (
                            <Box
                              style={{
                                width: 96,
                                height: 56,
                                borderRadius: 8,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Image
                                src={brand.imageUrl}
                                alt={brand.name}
                                fit="contain"
                                h={56}
                                w={96}
                              />
                            </Box>
                          ) : (
                            <Box
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Text size="xl" fw={700} c={primaryColor}>
                                {brand.name.charAt(0)}
                              </Text>
                            </Box>
                          )}
                          <Text size="sm" fw={500}>
                            {brand.name}
                          </Text>
                        </Stack>
                      </Card>
                    ))}
                  </SimpleGrid>
                </>
              )}
            </Stack>
          </Container>
        </Box>
      )}

      {/* CTA Section */}
      <Box
        py={60}
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -0.2)} 100%)`,
        }}
      >
        <Container size="md">
          <Stack gap="lg" align="center" ta="center">
            <Title order={2} size={36} c="white">
              ¿Listo para comprar?
            </Title>
            <Text size="lg" c="white" style={{ opacity: 0.9 }} maw={500}>
              Regístrate ahora y recibe ofertas exclusivas en tu correo.
              ¡No te pierdas nuestras promociones!
            </Text>
            <Group gap="md" mt="md">
              <Button
                size="lg"
                variant="white"
                color="dark"
                radius="xl"
                onClick={() => navigate('/register')}
              >
                Crear Cuenta
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="white"
                radius="xl"
                onClick={() => navigate('/products')}
              >
                Explorar Tienda
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

// Helper function to adjust color brightness
function adjustColor(hex: string, factor: number): string {
  hex = hex.replace('#', '');
  
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  if (factor > 0) {
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
  } else {
    r = Math.round(r * (1 + factor));
    g = Math.round(g * (1 + factor));
    b = Math.round(b * (1 + factor));
  }

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
