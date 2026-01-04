import { Container, Title, Text, Button, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Stack align="center" gap="xl" style={{ textAlign: 'center' }}>
        <Title order={1} size={48}>
          Bienvenido a Pegasus E-commerce
        </Title>
        <Text size="xl" c="dimmed">
          Tu tienda online de confianza en Perú
        </Text>
        <Button size="lg" onClick={() => navigate('/products')}>
          Explorar Productos
        </Button>
      </Stack>
    </Container>
  );
};
