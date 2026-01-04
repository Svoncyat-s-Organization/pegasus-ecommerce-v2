import { Container, Group, Text, Anchor } from '@mantine/core';

export const StorefrontFooter = () => {
  return (
    <Container
      size="xl"
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid #e9ecef',
      }}
    >
      <Text size="sm" c="dimmed">
        © 2026 Pegasus E-commerce. Todos los derechos reservados.
      </Text>
      <Group gap="md">
        <Anchor href="/terms" size="sm" c="dimmed">
          Términos y Condiciones
        </Anchor>
        <Anchor href="/privacy" size="sm" c="dimmed">
          Política de Privacidad
        </Anchor>
        <Anchor href="/contact" size="sm" c="dimmed">
          Contacto
        </Anchor>
      </Group>
    </Container>
  );
};
