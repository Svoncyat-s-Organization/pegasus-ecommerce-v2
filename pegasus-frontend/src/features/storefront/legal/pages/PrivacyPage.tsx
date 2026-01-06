import { Container, Title, Text, Paper, Stack, Group, ThemeIcon, Breadcrumbs, Anchor, Divider } from '@mantine/core';
import { IconLock, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';

/**
 * Privacy Policy Page
 * Displays privacy policy from storefront settings
 */
export const PrivacyPage = () => {
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
            Política de Privacidad
          </Text>
        </Breadcrumbs>

        {/* Header */}
        <Group>
          <ThemeIcon size="xl" variant="light" color="grape" radius="xl">
            <IconLock size={24} />
          </ThemeIcon>
          <div>
            <Title order={2}>Política de Privacidad</Title>
            <Text c="dimmed" size="sm">
              Tu privacidad es importante para nosotros
            </Text>
          </div>
        </Group>

        <Divider />

        {/* Content */}
        <Paper withBorder radius="md" p="xl">
          {settings?.privacyPolicy ? (
            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
              style={{ lineHeight: 1.8 }}
            />
          ) : (
            <Stack gap="md">
              <Text>
                Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos la
                información personal que usted nos proporciona al utilizar nuestro sitio web.
              </Text>
              
              <Title order={4}>1. Información que Recopilamos</Title>
              <Text c="dimmed">
                Recopilamos información que usted nos proporciona directamente, como su nombre, dirección
                de correo electrónico, número de teléfono, dirección de envío y datos de pago cuando
                realiza una compra o crea una cuenta.
              </Text>

              <Title order={4}>2. Uso de la Información</Title>
              <Text c="dimmed">
                Utilizamos su información para procesar pedidos, enviar actualizaciones sobre su compra,
                mejorar nuestros servicios, y comunicarnos con usted sobre ofertas y novedades (si ha
                dado su consentimiento).
              </Text>

              <Title order={4}>3. Protección de Datos</Title>
              <Text c="dimmed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información
                personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </Text>

              <Title order={4}>4. Compartir Información</Title>
              <Text c="dimmed">
                No vendemos ni alquilamos su información personal a terceros. Solo compartimos datos con
                proveedores de servicios necesarios para el funcionamiento de nuestra tienda (como
                empresas de envío y procesadores de pago).
              </Text>

              <Title order={4}>5. Cookies</Title>
              <Text c="dimmed">
                Utilizamos cookies para mejorar su experiencia de navegación, recordar sus preferencias
                y analizar el uso del sitio. Puede configurar su navegador para rechazar cookies, aunque
                esto puede afectar la funcionalidad del sitio.
              </Text>

              <Title order={4}>6. Sus Derechos</Title>
              <Text c="dimmed">
                Usted tiene derecho a acceder, rectificar, eliminar o limitar el uso de sus datos
                personales. Para ejercer estos derechos, contáctenos a través de nuestros canales de
                atención al cliente.
              </Text>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};
