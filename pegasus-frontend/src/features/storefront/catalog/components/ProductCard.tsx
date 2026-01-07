import { Card, Image, Text, Badge, Group, Stack, Button } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import type { ProductResponse } from '@types';
import { useProductImages, useProductVariants } from '../hooks/useProductVariants';
import { useCartStore } from '@features/storefront/cart';

interface ProductCardProps {
  product: ProductResponse;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { data: variants } = useProductVariants(product.id);
  const { data: images } = useProductImages(product.id);
  const addItem = useCartStore((state) => state.addItem);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Obtener primera variante disponible
    const firstVariant = variants?.[0];
    
    if (!firstVariant) {
      message.warning('No hay variantes disponibles para este producto');
      navigate(`/products/${product.id}`);
      return;
    }

    addItem({
      productId: product.id,
      variantId: firstVariant.id,
      sku: firstVariant.sku,
      productName: product.name,
      brandName: product.brandName,
      price: firstVariant.price,
      quantity: 1,
      imageUrl: mainImage,
      attributes: firstVariant.attributes as Record<string, string>,
    });

    message.success('Producto agregado al carrito');
  };

  // Obtener precio mínimo de las variantes
  const minPrice = variants && variants.length > 0
    ? Math.min(...variants.map((v) => v.price))
    : null;

  const mainImage = (() => {
    if (!images || images.length === 0) return '/placeholder-product.jpg';

    const sorted = [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.displayOrder - b.displayOrder;
    });

    return sorted[0]?.imageUrl || '/placeholder-product.jpg';
  })();

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
            {minPrice !== null ? (
              <>
                <Text size="xs" c="dimmed">Desde</Text>
                <Text size="lg" fw={700} c="blue">
                  S/ {minPrice.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text size="sm" c="dimmed">
                Consultar precio
              </Text>
            )}
          </div>

          <Button
            variant="filled"
            size="sm"
            leftSection={<IconShoppingCart size={16} />}
            onClick={handleAddToCart}
            disabled={!variants || variants.length === 0}
          >
            Agregar
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
