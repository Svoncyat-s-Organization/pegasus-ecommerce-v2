import { Stack, Text, Group, Divider, Image, Card } from '@mantine/core';
import type { CartItem } from '@features/storefront/cart';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  igv: number;
  shippingCost: number;
  total: number;
}

/**
 * CheckoutSummary Component
 * Resumen del pedido con items, precios y totales
 */
export const CheckoutSummary = ({ items, subtotal, igv, shippingCost, total }: CheckoutSummaryProps) => {
  return (
    <Card withBorder padding="lg">
      <Stack gap="md">
        <Text size="lg" fw={700}>
          Resumen del Pedido
        </Text>

        <Divider />

        {/* Items */}
        <Stack gap="sm">
          {items.map((item) => (
            <Group key={item.id} justify="space-between" align="flex-start">
              <Group gap="sm">
                <Image
                  src={item.imageUrl || 'https://placehold.co/60x60/E5E5EA/000000/png?text=Sin+Imagen'}
                  alt={item.productName}
                  width={60}
                  height={60}
                  fit="contain"
                />
                <div>
                  <Text size="sm" fw={500}>
                    {item.productName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.brandName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Cantidad: {item.quantity}
                  </Text>
                </div>
              </Group>
              <Text size="sm" fw={600}>
                S/ {(item.price * item.quantity).toFixed(2)}
              </Text>
            </Group>
          ))}
        </Stack>

        <Divider />

        {/* Totales */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm">Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</Text>
            <Text size="sm" fw={500}>
              S/ {subtotal.toFixed(2)}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm">IGV (18%)</Text>
            <Text size="sm" fw={500}>
              S/ {igv.toFixed(2)}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm">Envío</Text>
            <Text size="sm" fw={500}>
              {shippingCost > 0 ? `S/ ${shippingCost.toFixed(2)}` : 'Gratis'}
            </Text>
          </Group>
        </Stack>

        <Divider />

        {/* Total */}
        <Group justify="space-between">
          <Text size="lg" fw={700}>
            Total
          </Text>
          <Text size="xl" fw={700} c="blue">
            S/ {total.toFixed(2)}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};
