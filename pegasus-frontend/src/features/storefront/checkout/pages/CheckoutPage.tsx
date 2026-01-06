import { useState } from 'react';
import {
  Container,
  Stepper,
  Button,
  Group,
  Stack,
  Title,
  Text,
  Grid,
  Alert,
  Textarea,
  Paper,
  ThemeIcon,
  Card,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconMapPin,
  IconTruck,
  IconClipboardCheck,
  IconShoppingCart,
  IconArrowLeft,
  IconArrowRight,
} from '@tabler/icons-react';
import { useCartStore } from '@features/storefront/cart';
import { useStorefrontAuthStore } from '@stores/storefront/authStore';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useShippingMethods } from '../hooks/useShippingMethods';
import { AddressForm } from '../components/AddressForm';
import { ShippingMethodSelector } from '../components/ShippingMethodSelector';
import { CheckoutSummary } from '../components/CheckoutSummary';
import { formatCurrency } from '@shared/utils/formatters';
import type { CheckoutFormValues } from '../types/checkout.types';

/**
 * CheckoutPage - Página de checkout con stepper multi-paso
 * Paso 1: Dirección de envío
 * Paso 2: Método de envío
 * Paso 3: Revisión y confirmación
 */
export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  
  const { items, getSubtotal, getIGV, clearCart } = useCartStore();
  const { user } = useStorefrontAuthStore();
  const { getPrimaryColor, getSecondaryColor } = useStorefrontConfigStore();
  const { data: shippingMethods } = useShippingMethods();
  const createOrderMutation = useCreateOrder();

  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();
  const subtotal = getSubtotal();
  const igv = getIGV();

  // Form
  const form = useForm<CheckoutFormValues>({
    initialValues: {
      shippingAddress: {
        recipientName: '',
        recipientPhone: '',
        address: '',
        reference: '',
        ubigeoId: '',
      },
      shippingMethodId: null,
      notes: '',
    },
    validate: (values) => {
      if (active === 0) {
        return {
          'shippingAddress.recipientName': !values.shippingAddress.recipientName ? 'Nombre requerido' : null,
          'shippingAddress.recipientPhone': !values.shippingAddress.recipientPhone
            ? 'Teléfono requerido'
            : !/^9\d{8}$/.test(values.shippingAddress.recipientPhone)
            ? 'Debe ser 9 dígitos e iniciar con 9'
            : null,
          'shippingAddress.address': !values.shippingAddress.address ? 'Dirección requerida' : null,
          'shippingAddress.ubigeoId': !values.shippingAddress.ubigeoId ? 'Distrito requerido' : null,
        };
      }

      if (active === 1) {
        return {
          shippingMethodId: !values.shippingMethodId ? 'Selecciona un método de envío' : null,
        };
      }

      return {};
    },
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // Get selected shipping method
  const selectedShippingMethod = shippingMethods?.find((m) => m.id === form.values.shippingMethodId);
  const shippingCost = selectedShippingMethod?.baseCost || 0;
  const total = subtotal + igv + shippingCost;

  const nextStep = () => {
    const errors = form.validate();
    if (!errors.hasErrors) {
      setActive((current) => (current < 2 ? current + 1 : current));
    }
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async () => {
    if (!user) {
      notifications.show({
        title: 'Inicia sesión',
        message: 'Debes iniciar sesión para completar la compra',
        color: 'red',
      });
      navigate('/login');
      return;
    }

    try {
      const response = await createOrderMutation.mutateAsync({
        customerId: user.userId,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        shippingAddress: {
          ubigeoId: form.values.shippingAddress.ubigeoId,
          address: form.values.shippingAddress.address,
          reference: form.values.shippingAddress.reference,
          recipientName: form.values.shippingAddress.recipientName,
          recipientPhone: form.values.shippingAddress.recipientPhone,
        },
      });

      // Clear cart and navigate to confirmation
      clearCart();
      navigate(`/orders/confirmation/${response.id}`, {
        state: { orderData: response },
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      notifications.show({
        title: 'Error al procesar el pedido',
        message: err.response?.data?.message || 'Hubo un problema al crear tu pedido. Intenta nuevamente.',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl" py={40}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>Finalizar Compra</Title>
            <Text c="dimmed">Completa los siguientes pasos para confirmar tu pedido</Text>
          </div>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/cart')}
          >
            Volver al carrito
          </Button>
        </Group>

        {/* Stepper */}
        <Stepper
          active={active}
          onStepClick={setActive}
          allowNextStepsSelect={false}
          color={primaryColor.replace('#', '')}
        >
          <Stepper.Step
            label="Dirección"
            description="¿A dónde enviamos?"
            icon={<IconMapPin size={18} />}
          >
            <Paper withBorder radius="md" p="xl" mt="xl">
              <Group mb="lg">
                <ThemeIcon size="lg" variant="light" radius="xl">
                  <IconMapPin size={18} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>Dirección de Envío</Text>
                  <Text size="sm" c="dimmed">
                    Ingresa o selecciona la dirección donde recibirás tu pedido
                  </Text>
                </div>
              </Group>
              <AddressForm form={form} />
            </Paper>
          </Stepper.Step>

          <Stepper.Step
            label="Método de Envío"
            description="¿Cómo lo recibes?"
            icon={<IconTruck size={18} />}
          >
            <Paper withBorder radius="md" p="xl" mt="xl">
              <Group mb="lg">
                <ThemeIcon size="lg" variant="light" radius="xl">
                  <IconTruck size={18} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>Método de Envío</Text>
                  <Text size="sm" c="dimmed">
                    Elige cómo deseas recibir tu pedido
                  </Text>
                </div>
              </Group>
              <ShippingMethodSelector form={form} />
            </Paper>
          </Stepper.Step>

          <Stepper.Step
            label="Confirmar"
            description="Revisa tu pedido"
            icon={<IconClipboardCheck size={18} />}
          >
            <Paper withBorder radius="md" p="xl" mt="xl">
              <Group mb="lg">
                <ThemeIcon size="lg" variant="light" color="green" radius="xl">
                  <IconClipboardCheck size={18} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>Confirma tu Pedido</Text>
                  <Text size="sm" c="dimmed">
                    Revisa los detalles antes de confirmar
                  </Text>
                </div>
              </Group>

              <Stack gap="lg">
                {/* Address Summary */}
                <Card withBorder radius="md" padding="md" bg="gray.0">
                  <Group mb="xs">
                    <IconMapPin size={16} color="#868e96" />
                    <Text size="sm" fw={600}>
                      Dirección de Envío
                    </Text>
                  </Group>
                  <Text size="sm" fw={500}>
                    {form.values.shippingAddress.recipientName}
                  </Text>
                  <Text size="sm">
                    {form.values.shippingAddress.address}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {form.values.shippingAddress.districtName}, {form.values.shippingAddress.provinceName},{' '}
                    {form.values.shippingAddress.departmentName}
                  </Text>
                  {form.values.shippingAddress.reference && (
                    <Text size="xs" c="dimmed" mt="xs">
                      Ref: {form.values.shippingAddress.reference}
                    </Text>
                  )}
                  <Text size="sm" mt="xs">
                    Tel: +51 {form.values.shippingAddress.recipientPhone}
                  </Text>
                </Card>

                {/* Shipping Method Summary */}
                <Card withBorder radius="md" padding="md" bg="gray.0">
                  <Group mb="xs">
                    <IconTruck size={16} color="#868e96" />
                    <Text size="sm" fw={600}>
                      Método de Envío
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>
                        {selectedShippingMethod?.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {selectedShippingMethod?.carrier} -{' '}
                        {selectedShippingMethod?.estimatedDaysMin === selectedShippingMethod?.estimatedDaysMax
                          ? `${selectedShippingMethod?.estimatedDaysMin} días`
                          : `${selectedShippingMethod?.estimatedDaysMin}-${selectedShippingMethod?.estimatedDaysMax} días`}
                      </Text>
                    </div>
                    <Text size="sm" fw={600} style={{ color: shippingCost === 0 ? 'var(--mantine-color-green-6)' : primaryColor }}>
                      {shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}
                    </Text>
                  </Group>
                </Card>

                {/* Notes */}
                <Textarea
                  label="Notas adicionales (opcional)"
                  placeholder="Instrucciones especiales para la entrega..."
                  rows={3}
                  {...form.getInputProps('notes')}
                />
              </Stack>
            </Paper>
          </Stepper.Step>

          <Stepper.Completed>
            <Paper withBorder radius="md" p="xl" mt="xl">
              <Stack align="center" py={40}>
                <ThemeIcon size={80} radius="xl" color="green" variant="light">
                  <IconCheck size={48} />
                </ThemeIcon>
                <Title order={2} ta="center">
                  ¡Pedido confirmado!
                </Title>
                <Text c="dimmed" ta="center" maw={400}>
                  Tu pedido ha sido creado exitosamente. Pronto recibirás un correo con los detalles.
                </Text>
              </Stack>
            </Paper>
          </Stepper.Completed>
        </Stepper>

        {/* Grid: Actions + Summary */}
        <Grid gutter="xl" mt="xl">
          {/* Actions */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group justify="space-between">
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={prevStep}
                disabled={active === 0}
              >
                Anterior
              </Button>

              {active < 2 && (
                <Button
                  rightSection={<IconArrowRight size={16} />}
                  onClick={nextStep}
                  style={{ backgroundColor: primaryColor }}
                >
                  Siguiente
                </Button>
              )}

              {active === 2 && (
                <Button
                  onClick={handleSubmit}
                  loading={createOrderMutation.isPending}
                  size="lg"
                  leftSection={<IconShoppingCart size={20} />}
                  style={{ backgroundColor: secondaryColor }}
                >
                  Confirmar Pedido - {formatCurrency(total)}
                </Button>
              )}
            </Group>

            {/* Error Alert */}
            {createOrderMutation.isError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                mt="md"
              >
                No se pudo crear el pedido. Por favor, intenta nuevamente.
              </Alert>
            )}
          </Grid.Col>

          {/* Summary */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <div style={{ position: 'sticky', top: 80 }}>
              <CheckoutSummary
                items={items}
                subtotal={subtotal}
                igv={igv}
                shippingCost={shippingCost}
                total={total}
              />
            </div>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};
