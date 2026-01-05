import { Card, Image, Text, Badge, Group, Stack, Button } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { ProductResponse } from '@types';

interface ProductCardProps {
  product: ProductResponse;
  onAddToCart?: (productId: number) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  // TODO: Get image from variants/images API
  const mainImage = '/placeholder-product.jpg';

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
      onClick={handleCardClick}
    >
      <Card.Section>
        <Image src={mainImage} height={200} alt={product.name} fit="cover" />
      </Card.Section>

      <Stack gap="xs" mt="md" style={{ flex: 1 }}>
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="sm" lineClamp={2} style={{ flex: 1 }}>
            {product.name}
          </Text>
          {product.isFeatured && (
            <Badge color="yellow" size="sm">
              Destacado
            </Badge>
          )}
        </Group>

        <Text size="xs" c="dimmed" lineClamp={2}>
          {product.description}
        </Text>

        <Text size="xs" c="dimmed">
          {product.brandName}
        </Text>

        <Group justify="space-between" mt="auto">
          <div>
            <Text size="lg" fw={700}>
              {/* TODO: Get price from variants */}
              Consultar precio
            </Text>
          </div>

          <Button
            variant="filled"
            size="sm"
            leftSection={<IconShoppingCart size={16} />}
            onClick={handleAddToCart}
          >
            Agregar
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
