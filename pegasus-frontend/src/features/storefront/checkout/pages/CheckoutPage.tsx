import { useState } from 'react';
import { Container, Stepper, Button, Group, Stack, Title, Text, Grid, Alert, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { message } from 'antd';
import { useCartStore } from '@features/storefront/cart';
import { useStorefrontAuthStore } from '@stores/storefront/authStore';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useShippingMethods } from '../hooks/useShippingMethods';
import { AddressForm } from '../components/AddressForm';
import { ShippingMethodSelector } from '../components/ShippingMethodSelector';
import { CheckoutSummary } from '../components/CheckoutSummary';
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
  const { data: shippingMethods } = useShippingMethods();
  const createOrderMutation = useCreateOrder();

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
      message.error('Debes iniciar sesión para completar la compra');
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
      message.error(err.response?.data?.message || 'Error al crear el pedido');
    }
  };

  return (
    <Container size="xl" py={40}>
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={2}>Finalizar Compra</Title>
          <Text c="dimmed">Completa los siguientes pasos para confirmar tu pedido</Text>
        </div>

        {/* Stepper */}
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
          <Stepper.Step label="Envío" description="Dirección de entrega">
            <Stack gap="lg" mt="xl">
              <AddressForm form={form} />
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Método de Envío" description="Elige cómo recibirás tu pedido">
            <Stack gap="lg" mt="xl">
              <ShippingMethodSelector form={form} />
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Confirmar" description="Revisa tu pedido">
            <Stack gap="lg" mt="xl">
              {/* Address Summary */}
              <div>
                <Text size="lg" fw={600} mb="xs">
                  Dirección de Envío
                </Text>
                <Alert color="blue">
                  <Text size="sm" fw={500}>
                    {form.values.shippingAddress.recipientName}
                  </Text>
                  <Text size="sm">
                    {form.values.shippingAddress.address}
                  </Text>
                  <Text size="sm">
                    {form.values.shippingAddress.districtName}, {form.values.shippingAddress.provinceName},{' '}
                    {form.values.shippingAddress.departmentName}
                  </Text>
                  {form.values.shippingAddress.reference && (
                    <Text size="sm" c="dimmed">
                      Ref: {form.values.shippingAddress.reference}
                    </Text>
                  )}
                  <Text size="sm">Teléfono: +51 {form.values.shippingAddress.recipientPhone}</Text>
                </Alert>
              </div>

              {/* Shipping Method Summary */}
              <div>
                <Text size="lg" fw={600} mb="xs">
                  Método de Envío
                </Text>
                <Alert color="blue">
                  <Text size="sm" fw={500}>
                    {selectedShippingMethod?.name}
                  </Text>
                  <Text size="sm">{selectedShippingMethod?.description}</Text>
                  <Text size="sm" fw={600}>
                    Costo: S/ {shippingCost.toFixed(2)}
                  </Text>
                </Alert>
              </div>

              {/* Notes */}
              <Textarea
                label="Notas adicionales (opcional)"
                placeholder="Instrucciones especiales para la entrega..."
                rows={3}
                {...form.getInputProps('notes')}
              />
            </Stack>
          </Stepper.Step>

          <Stepper.Completed>
            <Stack align="center" py={60}>
              <IconCheck size={80} color="green" />
              <Text size="xl" fw={700}>
                ¡Pedido confirmado!
              </Text>
              <Text c="dimmed">Tu pedido ha sido creado exitosamente</Text>
            </Stack>
          </Stepper.Completed>
        </Stepper>

        {/* Grid: Actions + Summary */}
        <Grid gutter="xl" mt="xl">
          {/* Actions */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group justify="space-between">
              <Button variant="default" onClick={prevStep} disabled={active === 0}>
                Anterior
              </Button>

              {active < 2 && (
                <Button onClick={nextStep}>
                  Siguiente
                </Button>
              )}

              {active === 2 && (
                <Button
                  onClick={handleSubmit}
                  loading={createOrderMutation.isPending}
                  size="lg"
                >
                  Confirmar Pedido
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
