import { Stack, Text, Group, Divider, Image, Card, Badge, Box, ThemeIcon, TextInput, Button } from '@mantine/core';
import { IconShieldCheck, IconTruck, IconPackage } from '@tabler/icons-react';
import type { CartItem } from '@features/storefront/cart';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { formatCurrency } from '@shared/utils/formatters';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  igv: number;
  shippingCost: number;
  total: number;
  backgroundColor?: string;
}

/**
 * CheckoutSummary Component
 * Resumen del pedido con items, precios y totales
 */
export const CheckoutSummary = ({ items, subtotal, igv, shippingCost, total, backgroundColor }: CheckoutSummaryProps) => {
  const { getPrimaryColor } = useStorefrontConfigStore();
  const primaryColor = getPrimaryColor();

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card withBorder padding="lg" radius="md" style={{ backgroundColor: backgroundColor || 'white' }}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={700}>
            Resumen del Pedido
          </Text>
          <Badge variant="light" color="gray" size="lg">
            {totalQuantity} {totalQuantity === 1 ? 'artículo' : 'artículos'}
          </Badge>
        </Group>

        <Divider />

        {/* Items */}
        <Stack gap="sm">
          {items.map((item) => (
            <Group key={item.id} justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <Box
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: '#f8f9fa',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={item.imageUrl || '/placeholder-product.jpg'}
                    alt={item.productName}
                    w={60}
                    h={60}
                    fit="contain"
                  />
                </Box>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {item.productName}
                  </Text>
                  {item.brandName && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {item.brandName}
                    </Text>
                  )}
                  <Group gap="xs" mt={2}>
                    <Badge size="xs" variant="light" color="gray">
                      x{item.quantity}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {formatCurrency(item.price)} c/u
                    </Text>
                  </Group>
                </div>
              </Group>
              <Text size="sm" fw={600} style={{ flexShrink: 0 }}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </Group>
          ))}

        </Stack>

        <Divider />

        {/* Totales */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Subtotal</Text>
            <Text size="sm" fw={500}>
              {formatCurrency(subtotal)}
            </Text>
          </Group>

          <Group justify="space-between">
            <Group gap="xs">
              <IconTruck size={14} color="#868e96" />
              <Text size="sm" c="dimmed">Envío</Text>
            </Group>
            <Text size="sm" fw={500} c={shippingCost === 0 ? 'green' : undefined}>
              {shippingCost > 0 ? formatCurrency(shippingCost) : 'Gratis'}
            </Text>
          </Group>
        </Stack>

        <Divider />

        {/* Total */}
        <Group justify="space-between">
          <Text size="lg" fw={700}>
            Total a Pagar
          </Text>
          <Text size="xl" fw={700} style={{ color: primaryColor }}>
            {formatCurrency(total)}
          </Text>
        </Group>

        {/* Trust badges */}
        <Divider />
        <Group gap="lg" justify="center">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="green" radius="xl">
              <IconShieldCheck size={12} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Pago seguro</Text>
          </Group>
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
              <IconPackage size={12} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Envío garantizado</Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};
