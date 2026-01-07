import {
  Container,
  Grid,
  Image,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  Divider,
  NumberInput,
  Center,
  Paper,
  Box,
  ThemeIcon,
  Breadcrumbs,
  Anchor,
  Skeleton,
  Alert,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconHeart,
  IconTruck,
  IconShieldCheck,
  IconRefresh,
  IconCheck,
  IconX,
  IconMinus,
  IconPlus,
  IconChevronRight,
  IconPackage,
} from '@tabler/icons-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useProductDetail } from '../hooks/useProductDetail';
import {
  useProductVariants,
  useProductImages,
  useVariantStock,
} from '../hooks/useProductVariants';
import { useCartStore } from '@features/storefront/cart';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { formatCurrency } from '@shared/utils/formatters';
import { notifications } from '@mantine/notifications';
import { ProductRecommendations } from '../components/ProductRecommendations';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading: isLoadingProduct } = useProductDetail(productId);
  const { data: variants, isLoading: isLoadingVariants } = useProductVariants(productId);
  const { data: images } = useProductImages(productId);
  const { data: stock } = useVariantStock(selectedVariantId);
  const addItem = useCartStore((state) => state.addItem);
  const { getPrimaryColor, getSecondaryColor } = useStorefrontConfigStore();

  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();
  const isLoading = isLoadingProduct || isLoadingVariants;

  // Get selected variant
  const selectedVariant = useMemo(() => {
    return variants?.find((v) => v.id === selectedVariantId);
  }, [variants, selectedVariantId]);

  // Extract unique attribute keys and values for variant selection
  const attributeOptions = useMemo(() => {
    if (!variants || variants.length === 0) return {};

    const options: Record<string, Set<string>> = {};
    variants.forEach((variant) => {
      const attrs = variant.attributes as Record<string, string>;
      Object.entries(attrs).forEach(([key, value]) => {
        if (!options[key]) {
          options[key] = new Set();
        }
        options[key].add(value);
      });
    });

    return Object.fromEntries(
      Object.entries(options).map(([key, values]) => [key, Array.from(values)])
    );
  }, [variants]);

  // Selected attribute values state
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Find variant matching selected attributes
  const matchingVariant = useMemo(() => {
    if (!variants || Object.keys(selectedAttributes).length === 0) return null;

    return variants.find((variant) => {
      const attrs = variant.attributes as Record<string, string>;
      return Object.entries(selectedAttributes).every(
        ([key, value]) => attrs[key] === value
      );
    });
  }, [variants, selectedAttributes]);

  // Auto-select variant when attributes match
  useMemo(() => {
    if (matchingVariant && matchingVariant.id !== selectedVariantId) {
      setSelectedVariantId(matchingVariant.id);
    }
  }, [matchingVariant, selectedVariantId]);

  // Get display images (variant images first, then product images)
  const displayImages = useMemo(() => {
    if (!images || images.length === 0) {
      return [{ id: 0, imageUrl: '/placeholder-product.jpg', isPrimary: true, displayOrder: 0 }];
    }
    // Sort by displayOrder, with primary first
    return [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.displayOrder - b.displayOrder;
    });
  }, [images]);

  // Calculate price range for product
  const priceRange = useMemo(() => {
    if (!variants || variants.length === 0) return null;
    const prices = variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max, isSame: min === max };
  }, [variants]);

  const handleAttributeSelect = (key: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      notifications.show({
        title: 'Selecciona una variante',
        message: 'Por favor selecciona las opciones del producto',
        color: 'orange',
      });
      return;
    }

    if (stock !== undefined && stock < quantity) {
      notifications.show({
        title: 'Stock insuficiente',
        message: `Solo hay ${stock} unidades disponibles`,
        color: 'red',
      });
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
      imageUrl: displayImages[0]?.imageUrl,
      attributes: selectedVariant.attributes as Record<string, string>,
    });

    notifications.show({
      title: 'Producto agregado',
      message: `${quantity} unidad(es) de ${product.name} agregadas al carrito`,
      color: 'green',
      icon: <IconCheck size={18} />,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && (stock === undefined || newQty <= stock)) {
      setQuantity(newQty);
    }
  };

  if (isLoading) {
    return (
      <Container size="xl" py={60}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Skeleton height={400} radius="md" />
            <Group mt="md" gap="xs">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={80} width={80} radius="sm" />
              ))}
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Skeleton height={30} width="40%" />
              <Skeleton height={40} width="80%" />
              <Skeleton height={50} width="50%" />
              <Skeleton height={100} />
              <Skeleton height={48} />
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container size="xl" py={60}>
        <Center>
          <Stack align="center" gap="md">
            <IconPackage size={64} color="#adb5bd" />
            <Text size="xl" fw={600}>Producto no encontrado</Text>
            <Button onClick={() => navigate('/products')}>
              Ver catálogo
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" py={40}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        mb="xl"
        separator={<IconChevronRight size={14} color="#adb5bd" />}
      >
        <Anchor component={Link} to="/" size="sm" c="dimmed">
          Inicio
        </Anchor>
        <Anchor component={Link} to="/products" size="sm" c="dimmed">
          Productos
        </Anchor>
        {product.categoryName && (
          <Anchor
            component={Link}
            to={`/products?category=${product.categoryId}`}
            size="sm"
            c="dimmed"
          >
            {product.categoryName}
          </Anchor>
        )}
        <Text size="sm" c="dark" fw={500} lineClamp={1}>
          {product.name}
        </Text>
      </Breadcrumbs>

      <Grid gutter="xl">
        {/* Image Gallery */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            {/* Main Image */}
            <Paper withBorder radius="md" p="xs" style={{ overflow: 'hidden' }}>
              <Image
                src={displayImages[selectedImageIndex]?.imageUrl}
                alt={product.name}
                radius="sm"
                h={400}
                fit="contain"
                style={{ backgroundColor: '#fafafa' }}
              />
            </Paper>

            {/* Thumbnail Gallery */}
            {displayImages.length > 1 && (
              <Group gap="xs">
                {displayImages.map((img, index) => (
                  <Paper
                    key={img.id}
                    withBorder
                    radius="sm"
                    p={4}
                    style={{
                      cursor: 'pointer',
                      borderColor: index === selectedImageIndex ? primaryColor : undefined,
                      borderWidth: index === selectedImageIndex ? 2 : 1,
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`${product.name} - ${index + 1}`}
                      w={70}
                      h={70}
                      fit="contain"
                    />
                  </Paper>
                ))}
              </Group>
            )}
          </Stack>
        </Grid.Col>

        {/* Product Info */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            {/* Brand & Badges */}
            <Group gap="xs">
              {product.brandName && (
                <Badge variant="light" color="gray" size="lg">
                  {product.brandName}
                </Badge>
              )}
              {product.isFeatured && (
                <Badge color="yellow" variant="filled">
                  Destacado
                </Badge>
              )}
            </Group>

            {/* Product Name */}
            <Text size="1.75rem" fw={700} lh={1.3}>
              {product.name}
            </Text>

            {/* SKU */}
            <Text size="sm" c="dimmed">
              Código: {selectedVariant?.sku || product.code}
            </Text>

            {/* Price */}
            <Box>
              {selectedVariant ? (
                <Text size="2rem" fw={700} style={{ color: primaryColor }}>
                  {formatCurrency(selectedVariant.price)}
                </Text>
              ) : priceRange ? (
                <Text size="1.5rem" fw={600} c="dimmed">
                  {priceRange.isSame
                    ? formatCurrency(priceRange.min)
                    : `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`}
                </Text>
              ) : null}
            </Box>

            {/* Stock Indicator */}
            {selectedVariant && stock !== undefined && (
              <Group gap="xs">
                {stock > 10 ? (
                  <Badge
                    color="green"
                    variant="light"
                    leftSection={<IconCheck size={12} />}
                  >
                    Stock disponible ({stock} unidades)
                  </Badge>
                ) : stock > 0 ? (
                  <Badge
                    color="orange"
                    variant="light"
                    leftSection={<IconPackage size={12} />}
                  >
                    Últimas {stock} unidades
                  </Badge>
                ) : (
                  <Badge
                    color="red"
                    variant="light"
                    leftSection={<IconX size={12} />}
                  >
                    Agotado
                  </Badge>
                )}
              </Group>
            )}

            <Divider />

            {/* Variant Selector */}
            {Object.keys(attributeOptions).length > 0 && (
              <Stack gap="md">
                {Object.entries(attributeOptions).map(([attrKey, values]) => (
                  <Box key={attrKey}>
                    <Text size="sm" fw={600} mb="xs">
                      {attrKey}:
                      {selectedAttributes[attrKey] && (
                        <Text span c="dimmed" fw={400} ml="xs">
                          {selectedAttributes[attrKey]}
                        </Text>
                      )}
                    </Text>
                    <Group gap="xs">
                      {values.map((value) => (
                        <Button
                          key={value}
                          variant={
                            selectedAttributes[attrKey] === value ? 'filled' : 'outline'
                          }
                          size="sm"
                          radius="md"
                          onClick={() => handleAttributeSelect(attrKey, value)}
                          style={{
                            borderColor:
                              selectedAttributes[attrKey] === value
                                ? primaryColor
                                : undefined,
                            backgroundColor:
                              selectedAttributes[attrKey] === value
                                ? primaryColor
                                : undefined,
                          }}
                        >
                          {value}
                        </Button>
                      ))}
                    </Group>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Quantity Selector */}
            <Box>
              <Text size="sm" fw={600} mb="xs">
                Cantidad:
              </Text>
              <Group gap="xs">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <IconMinus size={16} />
                </Button>
                <NumberInput
                  value={quantity}
                  onChange={(val) => setQuantity(Number(val) || 1)}
                  min={1}
                  max={stock || 100}
                  w={80}
                  hideControls
                  styles={{ input: { textAlign: 'center' } }}
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={stock !== undefined && quantity >= stock}
                >
                  <IconPlus size={16} />
                </Button>
              </Group>
            </Box>

            {/* Action Buttons */}
            <Group gap="md" mt="md">
              <Button
                size="lg"
                radius="md"
                leftSection={<IconShoppingCart size={20} />}
                onClick={handleAddToCart}
                style={{ flex: 1, backgroundColor: primaryColor }}
                disabled={!selectedVariant || stock === 0}
              >
                Agregar al Carrito
              </Button>
              <Button
                size="lg"
                radius="md"
                variant="filled"
                onClick={handleBuyNow}
                style={{ flex: 1, backgroundColor: secondaryColor }}
                disabled={!selectedVariant || stock === 0}
              >
                Comprar Ahora
              </Button>
              <Button size="lg" radius="md" variant="light" color="pink">
                <IconHeart size={20} />
              </Button>
            </Group>

            {/* No Variant Selected Warning */}
            {!selectedVariant && variants && variants.length > 0 && (
              <Alert color="blue" variant="light">
                Selecciona las opciones del producto para ver el precio y stock.
              </Alert>
            )}

            <Divider />

            {/* Trust Badges */}
            <Group gap="xl" justify="center">
              <Stack gap={4} align="center">
                <ThemeIcon size="lg" variant="light" color="gray" radius="xl">
                  <IconTruck size={18} />
                </ThemeIcon>
                <Text size="xs" c="dimmed" ta="center">
                  Envío rápido
                </Text>
              </Stack>
              <Stack gap={4} align="center">
                <ThemeIcon size="lg" variant="light" color="gray" radius="xl">
                  <IconShieldCheck size={18} />
                </ThemeIcon>
                <Text size="xs" c="dimmed" ta="center">
                  Compra segura
                </Text>
              </Stack>
              <Stack gap={4} align="center">
                <ThemeIcon size="lg" variant="light" color="gray" radius="xl">
                  <IconRefresh size={18} />
                </ThemeIcon>
                <Text size="xs" c="dimmed" ta="center">
                  Devolución fácil
                </Text>
              </Stack>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Description & Specifications */}
      <Grid mt={60} gutter="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder radius="md" p="xl">
            <Text size="lg" fw={600} mb="md">
              Descripción
            </Text>
            <Text c="dimmed" style={{ whiteSpace: 'pre-line' }}>
              {product.description || 'Sin descripción disponible.'}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder radius="md" p="xl">
            <Text size="lg" fw={600} mb="md">
              Especificaciones
            </Text>
            {product.specs && Object.keys(product.specs).length > 0 ? (
              <Stack gap="sm">
                {Object.entries(product.specs).map(([key, value]) => (
                  <Group key={key} justify="space-between" wrap="nowrap">
                    <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
                      {key}
                    </Text>
                    <Text size="sm" fw={500} ta="right">
                      {String(value)}
                    </Text>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                Sin especificaciones disponibles.
              </Text>
            )}
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Product Recommendations - AI-powered similar products */}
      <ProductRecommendations productId={productId} limit={6} />
    </Container>
  );
};
