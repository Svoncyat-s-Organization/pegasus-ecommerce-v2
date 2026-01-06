import { Container, Title, Text, Paper, Stack, Group, ThemeIcon, Breadcrumbs, Anchor, Divider, List, Card, SimpleGrid } from '@mantine/core';
import { IconTruck, IconChevronRight, IconClock, IconMapPin, IconPackage } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';

/**
 * Shipping Policy Page
 * Displays shipping policy from storefront settings
 */
export const ShippingPolicyPage = () => {
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
            Política de Envíos
          </Text>
        </Breadcrumbs>

        {/* Header */}
        <Group>
          <ThemeIcon size="xl" variant="light" color="blue" radius="xl">
            <IconTruck size={24} />
          </ThemeIcon>
          <div>
            <Title order={2}>Política de Envíos</Title>
            <Text c="dimmed" size="sm">
              Información sobre tiempos y costos de envío
            </Text>
          </div>
        </Group>

        <Divider />

        {/* Quick Info Cards */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Card withBorder padding="md" radius="md">
            <Group gap="sm">
              <ThemeIcon size="lg" variant="light" radius="xl">
                <IconClock size={18} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={600}>Tiempo de Despacho</Text>
                <Text size="xs" c="dimmed">24-48 horas hábiles</Text>
              </div>
            </Group>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Group gap="sm">
              <ThemeIcon size="lg" variant="light" color="green" radius="xl">
                <IconMapPin size={18} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={600}>Cobertura</Text>
                <Text size="xs" c="dimmed">Todo el Perú</Text>
              </div>
            </Group>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Group gap="sm">
              <ThemeIcon size="lg" variant="light" color="orange" radius="xl">
                <IconPackage size={18} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={600}>Seguimiento</Text>
                <Text size="xs" c="dimmed">En todos los envíos</Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Content */}
        <Paper withBorder radius="md" p="xl">
          {settings?.shippingPolicy ? (
            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: settings.shippingPolicy }}
              style={{ lineHeight: 1.8 }}
            />
          ) : (
            <Stack gap="md">
              <Text>
                Nos esforzamos por entregar tus productos de manera rápida y segura. Aquí encontrarás
                toda la información sobre nuestros servicios de envío.
              </Text>
              
              <Title order={4}>1. Zonas de Entrega</Title>
              <Text c="dimmed">
                Realizamos envíos a nivel nacional, cubriendo todas las regiones del Perú. Los tiempos
                de entrega varían según la ubicación:
              </Text>
              <List size="sm" c="dimmed" withPadding>
                <List.Item>Lima Metropolitana: 1-3 días hábiles</List.Item>
                <List.Item>Provincias (Costa): 3-5 días hábiles</List.Item>
                <List.Item>Provincias (Sierra y Selva): 5-7 días hábiles</List.Item>
              </List>

              <Title order={4}>2. Costos de Envío</Title>
              <Text c="dimmed">
                Los costos de envío se calculan según el destino y el peso/volumen del paquete. Durante
                el proceso de checkout, podrás ver el costo exacto antes de confirmar tu pedido. Los
                envíos gratuitos aplican bajo ciertas condiciones promocionales.
              </Text>

              <Title order={4}>3. Tiempo de Procesamiento</Title>
              <Text c="dimmed">
                Una vez confirmado tu pago, procesamos tu pedido en un plazo de 24 a 48 horas hábiles.
                Recibirás un correo electrónico con el número de seguimiento para rastrear tu envío.
              </Text>

              <Title order={4}>4. Seguimiento de Pedidos</Title>
              <Text c="dimmed">
                Todos nuestros envíos incluyen número de seguimiento. Podrás verificar el estado de tu
                pedido ingresando a tu cuenta o usando el código de rastreo proporcionado por el courier.
              </Text>

              <Title order={4}>5. Intentos de Entrega</Title>
              <Text c="dimmed">
                El courier realizará hasta 2 intentos de entrega. Si no te encuentras, te dejará una
                notificación con instrucciones para coordinar una nueva entrega o recojo en agencia.
              </Text>

              <Title order={4}>6. Empaque Seguro</Title>
              <Text c="dimmed">
                Todos los productos son cuidadosamente empacados para garantizar que lleguen en
                perfectas condiciones. Los artículos frágiles reciben protección adicional.
              </Text>

              <Title order={4}>7. Problemas con el Envío</Title>
              <Text c="dimmed">
                Si tu paquete presenta retrasos significativos, daños o se extravía, contáctanos
                inmediatamente. Trabajaremos con el courier para resolver el problema y asegurarnos de
                que recibas tu pedido.
              </Text>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};
