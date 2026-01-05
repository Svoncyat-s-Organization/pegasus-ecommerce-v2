import { Container, Stack, Text, Button, Center } from '@mantine/core';
import { IconShoppingCartOff } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

/**
 * EmptyCart Component
 * Muestra un mensaje cuando el carrito está vacío con CTA para explorar productos
 */
export const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <Container size="sm" py={80}>
      <Center>
        <Stack align="center" gap="xl">
          <IconShoppingCartOff size={120} stroke={1.5} color="var(--mantine-color-gray-4)" />
          
          <Stack align="center" gap="xs">
            <Text size="xl" fw={700}>
              Tu carrito está vacío
            </Text>
            <Text size="md" c="dimmed" ta="center">
              Aún no has agregado productos a tu carrito. Explora nuestro catálogo y encuentra lo que necesitas.
            </Text>
          </Stack>

          <Button
            size="lg"
            onClick={() => navigate('/products')}
          >
            Explorar Productos
          </Button>
        </Stack>
      </Center>
    </Container>
  );
};
