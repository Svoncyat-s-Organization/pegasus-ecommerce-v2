import { Card, Stack, Group, Text, Divider, Button } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface CartSummaryProps {
  subtotal: number;
  igv: number;
  total: number;
  itemCount: number;
}

/**
 * CartSummary Component
 * Muestra el resumen de costos del carrito (subtotal, IGV, total)
 */
export const CartSummary = ({ subtotal, igv, total, itemCount }: CartSummaryProps) => {
  const navigate = useNavigate();

  return (
    <Card withBorder padding="lg">
      <Stack gap="md">
        <Text size="xl" fw={700}>
          Resumen del Pedido
        </Text>

        <Divider />

        {/* Subtotal */}
        <Group justify="space-between">
          <Text size="md">Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</Text>
          <Text size="md" fw={500}>
            S/ {subtotal.toFixed(2)}
          </Text>
        </Group>

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

        {/* Botón de checkout */}
        <Button
          size="lg"
          fullWidth
          leftSection={<IconShoppingCart size={20} />}
          onClick={() => navigate('/checkout')}
        >
          Proceder al Pago
        </Button>

        {/* Continuar comprando */}
        <Button
          size="md"
          fullWidth
          variant="light"
          onClick={() => navigate('/products')}
        >
          Continuar Comprando
        </Button>

        {/* Nota de envío */}
        <Text size="xs" c="dimmed" ta="center">
          Los costos de envío se calcularán en el siguiente paso
        </Text>
      </Stack>
    </Card>
  );
};
