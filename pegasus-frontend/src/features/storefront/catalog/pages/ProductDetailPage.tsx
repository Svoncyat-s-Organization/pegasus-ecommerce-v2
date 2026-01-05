import { Container, Grid, Image, Text, Stack, Group, Badge, Button, Divider, NumberInput, Loader, Center, Select } from '@mantine/core';
import { IconShoppingCart, IconHeart } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useProductDetail } from '../hooks/useProductDetail';
import { useProductVariants } from '../hooks/useProductVariants';
import { useCartStore } from '@features/storefront/cart';
import { message } from 'antd';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const { data: product, isLoading: isLoadingProduct } = useProductDetail(productId);
  const { data: variants, isLoading: isLoadingVariants } = useProductVariants(productId);
  const addItem = useCartStore((state) => state.addItem);

  const isLoading = isLoadingProduct || isLoadingVariants;

  // Obtener variante seleccionada
  const selectedVariant = variants?.find((v) => v.id === selectedVariantId);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      message.warning('Por favor selecciona una variante');
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      sku: selectedVariant.sku,
      productName: product.name,
      brandName: product.brandName,
      price: selectedVariant.price,
      quantity,
      imageUrl: undefined, // TODO: Get from images API
      attributes: selectedVariant.attributes as Record<string, string>,
    });

    message.success(`${quantity} unidad(es) agregadas al carrito`);
  };

  const handleAddToFavorites = () => {
    // TODO: Implement add to favorites
    message.success('Producto agregado a favoritos');
  };

  if (isLoading) {
    return (
      <Center py={100}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!product) {
    return (
      <Container size="xl" py={60}>
        <Center>
          <Text>Producto no encontrado</Text>
        </Center>
      </Container>
    );
  }

  // TODO: Get images from images API
  const mainImage = '/placeholder-product.jpg';

  return (
    <Container size="xl" py={40}>
      <Grid>
        {/* Images */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <Image src={mainImage} alt={product.name} radius="md" height={400} fit="contain" />
            {/* TODO: Add image gallery when images API is integrated */}
          </Stack>
        </Grid.Col>

        {/* Product Info */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            {/* Header */}
            <div>
              <Group mb="xs">
                <Text size="sm" c="dimmed">{product.brandName}</Text>
                {product.isFeatured && (
                  <Badge color="yellow">Destacado</Badge>
                )}
              </Group>
              <Text size="xl" fw={700} mb="xs">
                {product.name}
              </Text>
              <Text c="dimmed" size="sm">
                Código: {product.code}
              </Text>
            </div>

            <Divider />

            {/* Variant Selector */}
            {variants && variants.length > 0 && (
              <div>
                <Select
                  label="Selecciona una variante"
                  placeholder="Elige una opción"
                  data={variants.map((v) => ({
                    value: String(v.id),
                    label: `${Object.entries(v.attributes as Record<string, string>)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')} - S/ ${v.price.toFixed(2)}`,
                  }))}
                  value={selectedVariantId ? String(selectedVariantId) : null}
                  onChange={(value) => setSelectedVariantId(value ? Number(value) : null)}
                  required
                />
              </div>
            )}

            {/* Price */}
            <div>
              <Group align="baseline" gap="xs">
                {selectedVariant ? (
                  <Text size="2rem" fw={700} c="blue">
                    S/ {selectedVariant.price.toFixed(2)}
                  </Text>
                ) : (
                  <Text size="lg" c="dimmed">
                    Selecciona una variante para ver el precio
                  </Text>
                )}
              </Group>
            </div>

            <Divider />

            {/* Description */}
            <div>
              <Text fw={600} mb="xs">Descripción</Text>
              <Text size="sm">{product.description}</Text>
            </div>

            {/* Specifications */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <Text fw={600} mb="xs">Especificaciones</Text>
                <Stack gap="xs">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <Group key={key} justify="space-between">
                      <Text size="sm" c="dimmed">{key}:</Text>
                      <Text size="sm" fw={500}>{String(value)}</Text>
                    </Group>
                  ))}
                </Stack>
              </div>
            )}

            <Divider />

            {/* Actions */}
            <Stack gap="md">
              <NumberInput
                label="Cantidad"
                value={quantity}
                onChange={(val) => setQuantity(Number(val) || 1)}
                min={1}
                max={100}
                style={{ maxWidth: 150 }}
              />

              <Group>
                <Button
                  size="lg"
                  leftSection={<IconShoppingCart size={20} />}
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                  disabled={!selectedVariant}
                >
                  Agregar al Carrito
                </Button>
                <Button
                  size="lg"
                  variant="light"
                  leftSection={<IconHeart size={20} />}
                  onClick={handleAddToFavorites}
                >
                  Favoritos
                </Button>
              </Group>
            </Stack>

            {/* Additional Info */}
            <Stack gap="xs" mt="md">
              <Group>
                <Text size="sm" c="dimmed">Categoría:</Text>
                <Text size="sm" fw={500}>{product.categoryName}</Text>
              </Group>
              <Group>
                <Text size="sm" c="dimmed">Marca:</Text>
                <Text size="sm" fw={500}>{product.brandName}</Text>
              </Group>
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
