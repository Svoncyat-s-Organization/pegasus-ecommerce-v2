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
  Paper,
  ThemeIcon,
  Card,
  Checkbox,
  Radio,
  Divider,
  Badge,
  TextInput,
  Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconMapPin,
  IconTruck,
  IconShoppingCart,
  IconArrowLeft,
  IconArrowRight,
  IconCreditCard,
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
import { useDepartments, useProvinces, useDistricts } from '@shared/hooks/useLocations';

/**
 * CheckoutPage - Página de checkout con stepper multi-paso
 * Paso 1: Dirección de envío
 * Paso 2: Método de envío
 * Paso 3: Pago y Confirmación
 */
export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'yape' | 'plin'>('card');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');

  const { items, getSubtotal, getIGV, clearCart } = useCartStore();
  const { user } = useStorefrontAuthStore();
  const { getPrimaryColor } = useStorefrontConfigStore();
  const { data: shippingMethods } = useShippingMethods();
  const createOrderMutation = useCreateOrder();

  // Invoice State
  const [invoiceRazonSocial, setInvoiceRazonSocial] = useState('');
  const [invoiceRuc, setInvoiceRuc] = useState('');
  const [invoiceAddress, setInvoiceAddress] = useState('');
  const [invoicePhone, setInvoicePhone] = useState('902875868'); // Default from requirement
  const [invoiceDepartment, setInvoiceDepartment] = useState<string | undefined>(undefined);
  const [invoiceProvince, setInvoiceProvince] = useState<string | undefined>(undefined);
  const [invoiceDistrict, setInvoiceDistrict] = useState<string | undefined>(undefined);

  const { data: departments } = useDepartments();
  const { data: provinces } = useProvinces(invoiceDepartment);
  const { data: districts } = useDistricts(invoiceProvince);

  const [invoiceConfirmed, setInvoiceConfirmed] = useState(false);
  const [invoiceErrors, setInvoiceErrors] = useState<Record<string, string>>({});

  const validateInvoice = () => {
    const errors: Record<string, string> = {};
    if (!invoiceRazonSocial) errors.razonSocial = 'La razón social es requerida';

    if (!invoiceRuc) errors.ruc = 'El RUC es requerido';
    else if (!/^\d{11}$/.test(invoiceRuc)) errors.ruc = 'El RUC debe tener 11 números';

    if (!invoiceDepartment) errors.department = 'Requerido';
    if (!invoiceProvince) errors.province = 'Requerido';
    if (!invoiceDistrict) errors.district = 'Requerido';

    if (!invoiceAddress) errors.address = 'La dirección es requerida';

    if (!invoicePhone) errors.phone = 'El celular es requerido';
    else if (!/^\d{9}$/.test(invoicePhone)) errors.phone = 'El celular debe tener 9 dígitos';

    setInvoiceErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInvoiceConfirm = () => {
    if (!validateInvoice()) {
      notifications.show({
        title: 'Error en facturación',
        message: 'Por favor completa correctamente todos los campos obligatorios',
        color: 'red',
      });
      return;
    }
    setInvoiceConfirmed(true);
    setInvoiceErrors({});
    notifications.show({
      title: 'Datos guardados',
      message: 'Los datos de facturación se han guardado correctamente',
      color: 'green',
    });
  };

  const primaryColor = getPrimaryColor();
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

  const [paymentPhone, setPaymentPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiration, setCardExpiration] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  // ...

  const handleSubmit = async () => {
    if (!user) {
      notifications.show({ title: 'Inicia sesión', message: 'Debes iniciar sesión para completar la compra', color: 'red' });
      navigate('/login');
      return;
    }

    // Validar método de pago
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiration || !cardCvv || !cardHolderName) {
        notifications.show({
          title: 'Información incompleta',
          message: 'Por favor completa todos los datos de la tarjeta',
          color: 'red',
        });
        return;
      }
    } else if (paymentMethod === 'yape' || paymentMethod === 'plin') {
      if (!paymentTransactionId || !paymentPhone) {
        notifications.show({
          title: 'Información incompleta',
          message: `Por favor ingresa el celular y el código de aprobación de ${paymentMethod === 'yape' ? 'Yape' : 'Plin'}`,
          color: 'red'
        });
        return;
      }

      if (!/^\d{9}$/.test(paymentPhone)) {
        notifications.show({
          title: 'Celular inválido',
          message: 'El número de celular debe tener 9 dígitos',
          color: 'red'
        });
        return;
      }

      if (!/^\d{4}$/.test(paymentTransactionId)) {
        notifications.show({
          title: 'Código inválido',
          message: 'El código de aprobación debe tener 4 dígitos',
          color: 'red'
        });
        return;
      }
    }

    // Validar Factura si está seleccionada
    const isFactura = form.values.notes?.includes('FACTURA');
    if (isFactura) {
      // Always validate on submit to ensure data is correct even if user didn't click confirm
      if (!validateInvoice()) {
        notifications.show({
          title: 'Factura incompleta',
          message: 'Por favor corrige los campos de facturación marcados en rojo',
          color: 'red'
        });
        return;
      }
    }

    // Validar tarjeta (simulada)
    // En un caso real, Stripe/Culqi manejaría esto. Aquí asumimos valida si el form se ve.

    const generateTransactionId = () => {
      // Generar 2 letras aleatorias
      const l1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const l2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      // Generar 5 números aleatorios
      const n = Math.floor(10000 + Math.random() * 90000);
      // Formato: XX-12345 (Total 8 caracteres)
      return `${l1}${l2}-${n}`;
    };

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
        shippingMethodId: form.values.shippingMethodId || undefined,
        paymentMethod: paymentMethod,
        paymentTransactionId: generateTransactionId(),
        billingAddress: form.values.notes?.includes('FACTURA') ? {
          ubigeoId: invoiceDistrict || '',
          address: invoiceAddress,
          reference: `RUC: ${invoiceRuc}`,
          recipientName: invoiceRazonSocial,
          recipientPhone: invoicePhone
        } : undefined
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

        {/* Main Grid Layout */}
        <Grid gutter="xl" align="flex-start">
          {/* Left Column: Stepper + Content */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stepper
              active={active}
              onStepClick={setActive}
              allowNextStepsSelect={false}
              color={primaryColor.replace('#', '')}
              mb="xl"
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
                label="Pago"
                description="Realiza el pago"
                icon={<IconCreditCard size={18} />}
              >
                <Paper withBorder radius="md" p="xl" mt="xl">
                  {/* Datos del Comprador */}
                  <Stack gap="md" mb="xl">
                    <Title order={3} size="h4">Datos del comprador</Title>
                    <Checkbox
                      label="Mi dirección de facturación y de envío es la misma"
                      defaultChecked
                      color={primaryColor}
                    />

                    <Card withBorder radius="md" bg="gray.0" p="sm">
                      <Text size="sm" fw={500}>{form.values.shippingAddress.recipientName}</Text>
                      <Text size="xs" c="dimmed">Documento: {(user as any)?.docNumber || '-'}</Text>
                      <Text size="xs" c="dimmed">Tel: {form.values.shippingAddress.recipientPhone}</Text>
                      <Text size="xs" c="dimmed">{form.values.shippingAddress.address}</Text>
                    </Card>
                  </Stack>

                  <Divider my="xl" />

                  {/* Comprobante de Pago */}
                  <Stack gap="md" mb="xl">
                    <Title order={3} size="h4">Comprobante de pago</Title>
                    <Text size="sm" c="dimmed">Selecciona el comprobante de pago que prefieras.</Text>
                    <Radio.Group
                      value={form.values.notes?.includes('FACTURA') ? 'factura' : 'boleta'}
                      onChange={(val) => {
                        const currentNotes = form.values.notes || '';
                        const newNotes = val === 'factura'
                          ? currentNotes + ' [REQUIERE FACTURA]'
                          : currentNotes.replace(' [REQUIERE FACTURA]', '');
                        form.setFieldValue('notes', newNotes);
                      }}
                    >
                      <Group>
                        <Radio value="boleta" label="Boleta" color={primaryColor} />
                        <Radio value="factura" label="Factura" color={primaryColor} />
                      </Group>
                    </Radio.Group>

                    {form.values.notes?.includes('FACTURA') && (
                      <Paper withBorder p="md" radius="md" bg="gray.0" mt="sm">
                        <Grid>
                          <Grid.Col span={6}>
                            <TextInput
                              label="Razón social"
                              placeholder=""
                              required
                              value={invoiceRazonSocial}
                              onChange={(e) => {
                                setInvoiceRazonSocial(e.currentTarget.value);
                                if (invoiceErrors.razonSocial) setInvoiceErrors({ ...invoiceErrors, razonSocial: '' });
                              }}
                              error={invoiceErrors.razonSocial}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <TextInput
                              label="RUC"
                              placeholder=""
                              required
                              value={invoiceRuc}
                              maxLength={11}
                              onChange={(e) => {
                                const val = e.currentTarget.value.replace(/\D/g, ''); // Numeric only
                                setInvoiceRuc(val);
                                if (invoiceErrors.ruc) setInvoiceErrors({ ...invoiceErrors, ruc: '' });
                              }}
                              error={invoiceErrors.ruc}
                            />
                          </Grid.Col>

                          <Grid.Col span={6}>
                            <Select
                              label="Departamento"
                              placeholder="Selecciona"
                              data={departments?.map(d => ({ value: d.id, label: d.name })) || []}
                              value={invoiceDepartment}
                              onChange={(val) => {
                                setInvoiceDepartment(val || undefined);
                                setInvoiceProvince(undefined);
                                setInvoiceDistrict(undefined);
                                if (invoiceErrors.department && val) setInvoiceErrors({ ...invoiceErrors, department: '' });
                              }}
                              required
                              searchable
                              error={invoiceErrors.department}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <Select
                              label="Provincia"
                              placeholder="Selecciona"
                              data={provinces?.map(p => ({ value: p.id, label: p.name })) || []}
                              value={invoiceProvince}
                              onChange={(val) => {
                                setInvoiceProvince(val || undefined);
                                setInvoiceDistrict(undefined);
                                if (invoiceErrors.province && val) setInvoiceErrors({ ...invoiceErrors, province: '' });
                              }}
                              disabled={!invoiceDepartment}
                              required
                              searchable
                              error={invoiceErrors.province}
                            />
                          </Grid.Col>

                          <Grid.Col span={6}>
                            <Select
                              label="Distrito"
                              placeholder="Selecciona"
                              data={districts?.map(d => ({ value: d.id, label: d.name })) || []}
                              value={invoiceDistrict}
                              onChange={(val) => {
                                setInvoiceDistrict(val || undefined);
                                if (invoiceErrors.district && val) setInvoiceErrors({ ...invoiceErrors, district: '' });
                              }}
                              disabled={!invoiceProvince}
                              required
                              searchable
                              error={invoiceErrors.district}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <TextInput
                              label="Dirección"
                              description="Tipo y nombre de vía, número, manzana/lote"
                              required
                              value={invoiceAddress}
                              onChange={(e) => {
                                setInvoiceAddress(e.currentTarget.value);
                                if (invoiceErrors.address) setInvoiceErrors({ ...invoiceErrors, address: '' });
                              }}
                              error={invoiceErrors.address}
                            />
                          </Grid.Col>

                          <Grid.Col span={12}>
                            <TextInput
                              label="Celular"
                              required
                              value={invoicePhone}
                              maxLength={9}
                              onChange={(e) => {
                                const val = e.currentTarget.value.replace(/\D/g, ''); // Numeric only
                                setInvoicePhone(val);
                                if (invoiceErrors.phone) setInvoiceErrors({ ...invoiceErrors, phone: '' });
                              }}
                              error={invoiceErrors.phone}
                            />
                          </Grid.Col>

                          <Grid.Col span={12}>
                            <Group justify="flex-end">
                              <Button onClick={handleInvoiceConfirm} color={primaryColor}>
                                Confirmar
                              </Button>
                            </Group>
                          </Grid.Col>
                        </Grid>
                      </Paper>
                    )}
                  </Stack>

                  <Divider my="xl" />
                  {/* Medio de Pago */}
                  <Title order={3} size="h4">Medio de pago</Title>

                  <Radio.Group
                    value={paymentMethod}
                    onChange={(val) => setPaymentMethod(val as 'card' | 'yape' | 'plin')}
                  >
                    <Stack gap="md">
                      {/* Opción 1: Tarjeta */}
                      <Paper withBorder p="md" radius="md" style={{ borderColor: paymentMethod === 'card' ? primaryColor : undefined }}>
                        <Stack gap="md">
                          <Radio
                            value="card"
                            label="Pagar con una tarjeta de crédito o débito"
                            color={primaryColor}
                          />

                          {paymentMethod === 'card' && (
                            <>
                              {/* Logos Tarjetas */}
                              <Group gap="xs" ms="xl">
                                {['Visa', 'Mastercard', 'Amex'].map(card => (
                                  <Badge key={card} variant="outline" color="gray" size="lg" radius="sm">{card}</Badge>
                                ))}
                              </Group>

                              {/* Formulario Tarjeta */}
                              <Stack gap="sm" ms="xl">
                                <TextInput
                                  label="Número de Tarjeta"
                                  placeholder="0000 0000 0000 0000"
                                  required
                                  leftSection={<IconCreditCard size={16} />}
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.currentTarget.value)}
                                />
                                <Group grow>
                                  <TextInput
                                    label="Expiración (mes/año)"
                                    placeholder="MM/AA"
                                    required
                                    value={cardExpiration}
                                    onChange={(e) => setCardExpiration(e.currentTarget.value)}
                                  />
                                  <TextInput
                                    label="CVV"
                                    placeholder="123"
                                    required
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.currentTarget.value)}
                                  />
                                </Group>
                                <TextInput
                                  label="Titular de la Tarjeta"
                                  placeholder="Como figura en la tarjeta"
                                  required
                                  value={cardHolderName}
                                  onChange={(e) => setCardHolderName(e.currentTarget.value)}
                                />

                                <Button
                                  size="xl"
                                  mt="md"
                                  onClick={handleSubmit}
                                  loading={createOrderMutation.isPending}
                                  leftSection={<IconShoppingCart size={20} />}
                                  color={primaryColor}
                                >
                                  Pagar {formatCurrency(total)}
                                </Button>

                                <Stack gap="xs">
                                  <Text size="sm" fw={500}>¿Cómo pagar con Tarjeta de crédito o débito?</Text>
                                  <Group gap="xs" align="center">
                                    <IconArrowRight size={14} />
                                    <Text size="xs" c="dimmed">Asegúrate de haber ingresado el código de seguridad (CVV) correctamente.</Text>
                                  </Group>
                                </Stack>
                              </Stack>

                            </>
                          )}
                        </Stack>
                      </Paper>

                      {/* Opción 2: Yape */}
                      <Paper withBorder p="md" radius="md" style={{ borderColor: paymentMethod === 'yape' ? '#74007d' : undefined }}>
                        <Stack gap="md">
                          <Radio
                            value="yape"
                            label={<Text fw={600} style={{ color: '#74007d' }}>Pago con Yape</Text>}
                            color="#74007d"
                          />

                          {paymentMethod === 'yape' && (
                            <Stack ms="xl">
                              <Group grow>
                                <TextInput
                                  placeholder="Celular de Yape"
                                  size="md"
                                  value={paymentPhone}
                                  onChange={(e) => setPaymentPhone(e.currentTarget.value)}
                                />
                                <TextInput
                                  placeholder="Código de Aprobación"
                                  size="md"
                                  value={paymentTransactionId}
                                  onChange={(e) => setPaymentTransactionId(e.currentTarget.value)}
                                />
                              </Group>

                              <Button
                                size="xl"
                                color="#74007d"
                                onClick={handleSubmit}
                                loading={createOrderMutation.isPending}
                              >
                                Pagar {formatCurrency(total)}
                              </Button>

                              <Stack gap="xs">
                                <Text size="sm" fw={500}>¿Dónde encontrar tu Código de Aprobación?</Text>
                                <Group gap="xs" align="start">
                                  <IconArrowRight size={14} style={{ marginTop: 4 }} />
                                  <Text size="xs" c="dimmed">
                                    Luego de abrir tu aplicación de Yape, encontrarás el ícono de Código de Aprobación en la parte superior.
                                  </Text>
                                </Group>
                              </Stack>
                            </Stack>
                          )}
                        </Stack>
                      </Paper>

                      {/* Opción 3: Plin */}
                      <Paper withBorder p="md" radius="md" style={{ borderColor: paymentMethod === 'plin' ? '#00c7b1' : undefined }}>
                        <Stack gap="md">
                          <Radio
                            value="plin"
                            label={<Text fw={600} style={{ color: '#00c7b1' }}>Pago con Plin</Text>}
                            color="#00c7b1"
                          />

                          {paymentMethod === 'plin' && (
                            <Stack ms="xl">
                              <Group grow>
                                <TextInput
                                  placeholder="Celular de Plin"
                                  size="md"
                                  value={paymentPhone}
                                  onChange={(e) => setPaymentPhone(e.currentTarget.value)}
                                />
                                <TextInput
                                  placeholder="Código de Aprobación"
                                  size="md"
                                  value={paymentTransactionId}
                                  onChange={(e) => setPaymentTransactionId(e.currentTarget.value)}
                                />
                              </Group>

                              <Button
                                size="xl"
                                color="#00c7b1"
                                onClick={handleSubmit}
                                loading={createOrderMutation.isPending}
                              >
                                Pagar {formatCurrency(total)}
                              </Button>
                            </Stack>
                          )}
                        </Stack>
                      </Paper>
                    </Stack>
                  </Radio.Group>
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

            {/* Navigation Buttons */}
            {active !== 2 ? (
              <Group justify="space-between" mt="xl">
                <Button
                  variant="default"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={prevStep}
                  disabled={active === 0}
                >
                  Anterior
                </Button>

                <Button
                  rightSection={<IconArrowRight size={16} />}
                  onClick={nextStep}
                  style={{ backgroundColor: primaryColor }}
                >
                  Siguiente
                </Button>
              </Group>
            ) : (
              <Button variant="default" onClick={prevStep} leftSection={<IconArrowLeft size={16} />}>
                Volver / Editar datos
              </Button>
            )}

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

          {/* Right Column: Summary */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <div style={{ position: 'sticky', top: 80 }}>
              <CheckoutSummary
                items={items}
                subtotal={subtotal}
                igv={igv}
                shippingCost={shippingCost}
                total={total}
                // @ts-ignore
                backgroundColor="#f0f9ff"
              />

              <Card withBorder radius="md" mt="md">
                <Group justify="space-between" mb="xs">
                  <Text size="lg" fw={600}>Información de Entrega</Text>
                  {active !== 0 && (
                    <Button variant="subtle" size="xs" onClick={() => setActive(0)}>Editar</Button>
                  )}
                </Group>
                <Text size="sm" c="dimmed">Envío a domicilio</Text>
                <Text size="sm">
                  {form.values.shippingAddress.address ? `${form.values.shippingAddress.address}, ${form.values.shippingAddress.districtName}` : 'No seleccionada'}
                </Text>
              </Card>
            </div>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};
