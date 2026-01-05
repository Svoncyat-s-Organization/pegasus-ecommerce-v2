import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useFeaturedProducts } from '@features/storefront/catalog';
import { ProductGrid } from '@features/storefront/catalog/components/ProductGrid';

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: featuredProducts, isLoading } = useFeaturedProducts(0, 8);

  return (
    <Container size="xl" py={60}>
      <Stack gap="xl">
        {/* Hero Section */}
        <Stack align="center" gap="md" py={40}>
          <Title order={1} size={48}>
            Bienvenido a Pegasus E-commerce
          </Title>
          <Text size="xl" c="dimmed" maw={600} ta="center">
            Tu tienda online de confianza en Perú
          </Text>
          <Group mt="md">
            <Button size="lg" onClick={() => navigate('/products')}>
              Explorar Productos
            </Button>
          </Group>
        </Stack>

        {/* Featured Products */}
        <Stack gap="lg" mt={40}>
          <Group justify="space-between" align="baseline">
            <div>
              <Title order={2}>Productos Destacados</Title>
              <Text c="dimmed">Los productos más populares</Text>
            </div>
            <Button variant="subtle" onClick={() => navigate('/products')}>
              Ver todos →
            </Button>
          </Group>

          <ProductGrid
            products={featuredProducts?.content || []}
            isLoading={isLoading}
          />
        </Stack>
      </Stack>
    </Container>
  );
};
