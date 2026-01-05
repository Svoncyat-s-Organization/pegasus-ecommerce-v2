import { Container, Stack, Title, Text, Button, Group, Alert, Card } from '@mantine/core';
import { IconCheck, IconShoppingBag } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { CreateOrderResponse } from '../types/checkout.types';

/**
 * OrderConfirmationPage - Página de confirmación después de crear un pedido
 */
export const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData as CreateOrderResponse | undefined;

  // Si no hay datos del pedido, redirigir al home
  if (!orderData) {
    navigate('/');
    return null;
  }

  return (
    <Container size="sm" py={60}>
      <Stack align="center" gap="xl">
        {/* Success Icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: 'var(--mantine-color-green-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconCheck size={60} color="var(--mantine-color-green-6)" />
        </div>

        {/* Header */}
        <Stack align="center" gap="xs">
          <Title order={1}>¡Pedido Confirmado!</Title>
          <Text size="lg" c="dimmed" ta="center">
            Tu pedido ha sido creado exitosamente y está siendo procesado
          </Text>
        </Stack>

        {/* Order Details */}
        <Card withBorder padding="lg" style={{ width: '100%' }}>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Número de Pedido</Text>
              <Text fw={700} c="blue" size="lg">
                {orderData.orderNumber}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text fw={500}>Total Pagado</Text>
              <Text fw={700} size="lg">
                S/ {orderData.total.toFixed(2)}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text fw={500}>Fecha</Text>
              <Text>
                {new Date(orderData.createdAt).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Info Alert */}
        <Alert color="blue" style={{ width: '100%' }}>
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              ¿Qué sigue?
            </Text>
            <Text size="sm">
              1. Recibirás un correo de confirmación con los detalles de tu pedido
            </Text>
            <Text size="sm">
              2. Nuestro equipo procesará tu pedido
            </Text>
            <Text size="sm">
              3. Te notificaremos cuando tu pedido sea enviado
            </Text>
            <Text size="sm">
              4. Puedes seguir el estado de tu pedido desde tu perfil
            </Text>
          </Stack>
        </Alert>

        {/* Actions */}
        <Group mt="md">
          <Button
            size="lg"
            leftSection={<IconShoppingBag size={20} />}
            onClick={() => navigate('/orders')}
          >
            Ver Mis Pedidos
          </Button>
          <Button
            size="lg"
            variant="light"
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};
