import { Container, Title, Text, Paper, Stack, Group, ThemeIcon, Breadcrumbs, Anchor, Divider, List } from '@mantine/core';
import { IconRefresh, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';

/**
 * Returns Policy Page
 * Displays returns and refunds policy from storefront settings
 */
export const ReturnsPage = () => {
  const { settings } = useStorefrontConfigStore();

  return (
    <Container size="md" py={40}>
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<IconChevronRight size={14} color="#adb5bd" />}>
          <Anchor component={Link} to="/" size="sm" c="dimmed">
            Inicio
          </Anchor>
          <Text size="sm" c="dark" fw={500}>
            Política de Devoluciones
          </Text>
        </Breadcrumbs>

        {/* Header */}
        <Group>
          <ThemeIcon size="xl" variant="light" color="orange" radius="xl">
            <IconRefresh size={24} />
          </ThemeIcon>
          <div>
            <Title order={2}>Política de Devoluciones</Title>
            <Text c="dimmed" size="sm">
              Tu satisfacción es nuestra prioridad
            </Text>
          </div>
        </Group>

        <Divider />

        {/* Content */}
        <Paper withBorder radius="md" p="xl">
          {settings?.returnPolicy ? (
            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: settings.returnPolicy }}
              style={{ lineHeight: 1.8 }}
            />
          ) : (
            <Stack gap="md">
              <Text>
                Queremos que estés completamente satisfecho con tu compra. Si por algún motivo no lo
                estás, aquí te explicamos cómo proceder con una devolución o cambio.
              </Text>
              
              <Title order={4}>1. Plazo de Devolución</Title>
              <Text c="dimmed">
                Tienes hasta 7 días calendario desde la recepción del producto para solicitar una
                devolución o cambio, de acuerdo con la normativa peruana de protección al consumidor.
              </Text>

              <Title order={4}>2. Condiciones para Devolución</Title>
              <Text c="dimmed" mb="xs">
                Para que tu devolución sea aceptada, el producto debe cumplir con las siguientes condiciones:
              </Text>
              <List size="sm" c="dimmed" withPadding>
                <List.Item>Estar en su empaque original, sin abrir</List.Item>
                <List.Item>No presentar signos de uso o daños causados por el cliente</List.Item>
                <List.Item>Incluir todos los accesorios y documentación original</List.Item>
                <List.Item>Presentar el comprobante de compra (boleta o factura)</List.Item>
              </List>

              <Title order={4}>3. Productos Defectuosos</Title>
              <Text c="dimmed">
                Si recibes un producto defectuoso o dañado durante el transporte, contáctanos
                inmediatamente. Cubriremos los costos de devolución y te enviaremos un producto de
                reemplazo o realizaremos un reembolso completo.
              </Text>

              <Title order={4}>4. Proceso de Devolución</Title>
              <Text c="dimmed" mb="xs">
                Para iniciar una devolución:
              </Text>
              <List size="sm" c="dimmed" withPadding type="ordered">
                <List.Item>Contáctanos por correo electrónico o WhatsApp</List.Item>
                <List.Item>Indica tu número de pedido y motivo de la devolución</List.Item>
                <List.Item>Recibirás instrucciones para el envío del producto</List.Item>
                <List.Item>Una vez recibido y verificado, procesaremos tu reembolso o cambio</List.Item>
              </List>

              <Title order={4}>5. Reembolsos</Title>
              <Text c="dimmed">
                Los reembolsos se procesarán en un plazo de 5 a 10 días hábiles después de recibir el
                producto devuelto. El reembolso se realizará por el mismo método de pago utilizado en
                la compra original.
              </Text>

              <Title order={4}>6. Excepciones</Title>
              <Text c="dimmed">
                Algunos productos no son elegibles para devolución por razones de higiene o seguridad.
                Estos serán indicados claramente en la descripción del producto.
              </Text>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};
