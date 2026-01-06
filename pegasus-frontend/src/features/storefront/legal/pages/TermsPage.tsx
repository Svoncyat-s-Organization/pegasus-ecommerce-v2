import { Container, Title, Text, Paper, Stack, Group, ThemeIcon, Breadcrumbs, Anchor, Divider } from '@mantine/core';
import { IconFileText, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';

/**
 * Terms and Conditions Page
 * Displays terms and conditions from storefront settings
 */
export const TermsPage = () => {
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
            Términos y Condiciones
          </Text>
        </Breadcrumbs>

        {/* Header */}
        <Group>
          <ThemeIcon size="xl" variant="light" radius="xl">
            <IconFileText size={24} />
          </ThemeIcon>
          <div>
            <Title order={2}>Términos y Condiciones</Title>
            <Text c="dimmed" size="sm">
              Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </div>
        </Group>

        <Divider />

        {/* Content */}
        <Paper withBorder radius="md" p="xl">
          {settings?.termsAndConditions ? (
            <div
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: settings.termsAndConditions }}
              style={{ lineHeight: 1.8 }}
            />
          ) : (
            <Stack gap="md">
              <Text>
                Bienvenido a nuestra tienda en línea. Al acceder y utilizar este sitio web, usted acepta
                cumplir con los siguientes términos y condiciones de uso.
              </Text>
              
              <Title order={4}>1. Uso del Sitio</Title>
              <Text c="dimmed">
                Este sitio web está destinado únicamente para uso personal y no comercial. Al utilizar
                este sitio, usted garantiza que tiene al menos 18 años de edad o que cuenta con el
                consentimiento de un padre o tutor legal.
              </Text>

              <Title order={4}>2. Productos y Precios</Title>
              <Text c="dimmed">
                Nos esforzamos por mostrar información precisa sobre nuestros productos. Sin embargo, no
                garantizamos que las descripciones, imágenes o precios sean completamente exactos. Nos
                reservamos el derecho de corregir cualquier error y de cancelar pedidos si es necesario.
              </Text>

              <Title order={4}>3. Proceso de Compra</Title>
              <Text c="dimmed">
                Al realizar un pedido, usted acepta proporcionar información precisa y completa. Nos
                reservamos el derecho de rechazar o cancelar pedidos por cualquier motivo, incluyendo
                disponibilidad de productos o sospecha de actividad fraudulenta.
              </Text>

              <Title order={4}>4. Pago</Title>
              <Text c="dimmed">
                Aceptamos los métodos de pago indicados en nuestro sitio. El pago debe completarse antes
                del envío de los productos. Los precios están expresados en Soles Peruanos (PEN) e
                incluyen IGV donde corresponda.
              </Text>

              <Title order={4}>5. Limitación de Responsabilidad</Title>
              <Text c="dimmed">
                En la medida permitida por la ley, no seremos responsables por daños indirectos,
                incidentales, especiales o consecuentes que surjan del uso de nuestro sitio o productos.
              </Text>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};
