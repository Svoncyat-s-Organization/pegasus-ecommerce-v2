import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  ThemeIcon,
  Breadcrumbs,
  Anchor,
  Divider,
  Card,
  SimpleGrid,
  TextInput,
  Textarea,
  Button,
} from '@mantine/core';
import {
  IconMail,
  IconChevronRight,
  IconPhone,
  IconMapPin,
  IconBrandWhatsapp,
  IconClock,
  IconSend,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';

/**
 * Contact Page
 * Displays contact information and a contact form
 */
export const ContactPage = () => {
  const { settings, businessInfo, getPrimaryColor } = useStorefrontConfigStore();
  const primaryColor = getPrimaryColor();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
    validate: {
      name: (value) => (!value ? 'Nombre requerido' : null),
      email: (value) => (!value ? 'Correo requerido' : !/^\S+@\S+$/.test(value) ? 'Correo inválido' : null),
      subject: (value) => (!value ? 'Asunto requerido' : null),
      message: (value) => (!value ? 'Mensaje requerido' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', values);
    notifications.show({
      title: 'Mensaje enviado',
      message: 'Hemos recibido tu mensaje. Te responderemos a la brevedad.',
      color: 'green',
    });
    form.reset();
  };

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<IconChevronRight size={14} color="#adb5bd" />}>
          <Anchor component={Link} to="/" size="sm" c="dimmed">
            Inicio
          </Anchor>
          <Text size="sm" c="dark" fw={500}>
            Contacto
          </Text>
        </Breadcrumbs>

        {/* Header */}
        <Group>
          <ThemeIcon size="xl" variant="light" color="teal" radius="xl">
            <IconMail size={24} />
          </ThemeIcon>
          <div>
            <Title order={2}>Contáctanos</Title>
            <Text c="dimmed" size="sm">
              Estamos aquí para ayudarte
            </Text>
          </div>
        </Group>

        <Divider />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* Contact Information */}
          <Stack gap="lg">
            <Title order={4}>Información de Contacto</Title>

            {/* Contact Cards */}
            <Stack gap="md">
              {(settings?.supportEmail || businessInfo?.email) && (
                <Card withBorder padding="md" radius="md">
                  <Group gap="md">
                    <ThemeIcon size="lg" variant="light" radius="xl">
                      <IconMail size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={600}>Correo Electrónico</Text>
                      <Anchor
                        href={`mailto:${settings?.supportEmail || businessInfo?.email}`}
                        size="sm"
                        c="dimmed"
                      >
                        {settings?.supportEmail || businessInfo?.email}
                      </Anchor>
                    </div>
                  </Group>
                </Card>
              )}

              {(settings?.supportPhone || businessInfo?.phone) && (
                <Card withBorder padding="md" radius="md">
                  <Group gap="md">
                    <ThemeIcon size="lg" variant="light" color="blue" radius="xl">
                      <IconPhone size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={600}>Teléfono</Text>
                      <Anchor
                        href={`tel:${settings?.supportPhone || businessInfo?.phone}`}
                        size="sm"
                        c="dimmed"
                      >
                        +51 {settings?.supportPhone || businessInfo?.phone}
                      </Anchor>
                    </div>
                  </Group>
                </Card>
              )}

              {settings?.whatsappNumber && (
                <Card withBorder padding="md" radius="md">
                  <Group gap="md">
                    <ThemeIcon size="lg" variant="light" color="green" radius="xl">
                      <IconBrandWhatsapp size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={600}>WhatsApp</Text>
                      <Anchor
                        href={`https://wa.me/51${settings.whatsappNumber}`}
                        target="_blank"
                        size="sm"
                        c="dimmed"
                      >
                        +51 {settings.whatsappNumber}
                      </Anchor>
                    </div>
                  </Group>
                </Card>
              )}

              {businessInfo?.legalAddress && (
                <Card withBorder padding="md" radius="md">
                  <Group gap="md" align="flex-start">
                    <ThemeIcon size="lg" variant="light" color="orange" radius="xl">
                      <IconMapPin size={18} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={600}>Dirección</Text>
                      <Text size="sm" c="dimmed">
                        {businessInfo.legalAddress}
                      </Text>
                    </div>
                  </Group>
                </Card>
              )}

              <Card withBorder padding="md" radius="md">
                <Group gap="md">
                  <ThemeIcon size="lg" variant="light" color="grape" radius="xl">
                    <IconClock size={18} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={600}>Horario de Atención</Text>
                    <Text size="sm" c="dimmed">
                      Lunes a Viernes: 9:00 AM - 6:00 PM
                    </Text>
                    <Text size="sm" c="dimmed">
                      Sábados: 9:00 AM - 1:00 PM
                    </Text>
                  </div>
                </Group>
              </Card>
            </Stack>
          </Stack>

          {/* Contact Form */}
          <Paper withBorder radius="md" p="xl">
            <Title order={4} mb="lg">Envíanos un Mensaje</Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Nombre completo"
                  placeholder="Tu nombre"
                  required
                  {...form.getInputProps('name')}
                />

                <TextInput
                  label="Correo electrónico"
                  placeholder="tu@email.com"
                  required
                  {...form.getInputProps('email')}
                />

                <TextInput
                  label="Teléfono (opcional)"
                  placeholder="987654321"
                  maxLength={9}
                  {...form.getInputProps('phone')}
                />

                <TextInput
                  label="Asunto"
                  placeholder="¿En qué podemos ayudarte?"
                  required
                  {...form.getInputProps('subject')}
                />

                <Textarea
                  label="Mensaje"
                  placeholder="Escribe tu mensaje aquí..."
                  rows={5}
                  required
                  {...form.getInputProps('message')}
                />

                <Button
                  type="submit"
                  size="md"
                  leftSection={<IconSend size={18} />}
                  style={{ backgroundColor: primaryColor }}
                >
                  Enviar Mensaje
                </Button>
              </Stack>
            </form>
          </Paper>
        </SimpleGrid>
      </Stack>
    </Container>
  );
};
