import { useState, useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Badge,
  Button,
  Loader,
  Center,
  Table,
  Modal,
  Divider,
  Box,
  Pagination,
  ThemeIcon,
  SimpleGrid,
  ActionIcon,
  Stepper,
  Alert,
} from '@mantine/core';
import { StorefrontInvoicePrint } from '../components/StorefrontInvoicePrint';
import { useReactToPrint } from 'react-to-print';
import {
  IconPackage,
  IconEye,
  IconX,
  IconShoppingCart,
  IconTruck,
  IconCheck,
  IconClock,
  IconMapPin,
  IconBuildingStore,
  IconReceipt,
  IconCash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useMyOrders, useMyOrderDetail, useCancelMyOrder } from '../hooks/useOrders';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { formatCurrency, formatDate } from '@shared/utils/formatters';
import type { OrderSummaryResponse, OrderStatus } from '@types';

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'yellow',
  AWAIT_PAYMENT: 'orange',
  PAID: 'blue',
  PROCESSING: 'cyan',
  SHIPPED: 'indigo',
  DELIVERED: 'green',
  CANCELLED: 'red',
  REFUNDED: 'gray',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  AWAIT_PAYMENT: 'Esperando Pago',
  PAID: 'Pagado',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};



export const OrdersPage = () => {
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Comprobante',
  });
  const [page, setPage] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data, isLoading } = useMyOrders(page, 10);
  const { data: orderDetail, isLoading: detailLoading } = useMyOrderDetail(selectedOrderId);
  const cancelOrderMutation = useCancelMyOrder();
  const { getPrimaryColor } = useStorefrontConfigStore();

  const primaryColor = getPrimaryColor();

  const handleViewOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
  };

  const handleCancelOrder = (order: OrderSummaryResponse) => {
    if (!['PENDING', 'AWAIT_PAYMENT'].includes(order.status)) {
      notifications.show({
        title: 'No se puede cancelar',
        message: 'Solo se pueden cancelar pedidos pendientes o en espera de pago',
        color: 'red',
      });
      return;
    }

    modals.openConfirmModal({
      title: 'Cancelar Pedido',
      children: (
        <Text size="sm">
          ¿Estás seguro de que deseas cancelar el pedido #{order.orderNumber}?
          Esta acción no se puede deshacer.
        </Text>
      ),
      labels: { confirm: 'Cancelar Pedido', cancel: 'Volver' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await cancelOrderMutation.mutateAsync({ id: order.id });
          notifications.show({
            title: 'Pedido cancelado',
            message: 'Tu pedido ha sido cancelado correctamente',
            color: 'green',
          });
        } catch {
          notifications.show({
            title: 'Error',
            message: 'No se pudo cancelar el pedido',
            color: 'red',
          });
        }
      },
    });
  };

  const getStepperActiveStep = (status: OrderStatus): number => {
    switch (status) {
      case 'PENDING':
      case 'AWAIT_PAYMENT':
        return 0; // Pendiente
      case 'PAID':
        return 1; // Pago
      case 'PROCESSING':
        return 3; // En Proceso (assume Comprobante done)
      case 'SHIPPED':
        return 4; // Enviado
      case 'DELIVERED':
        return 5; // Entregado
      case 'CANCELLED':
      case 'REFUNDED':
        return 0; // Cancelado
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <Center py={100}>
        <Loader size="lg" color={primaryColor} />
      </Center>
    );
  }

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>Mis Pedidos</Title>
            <Text c="dimmed">Historial y seguimiento de tus compras recientes</Text>
          </div>
        </Group>

        {/* Orders List */}
        {data?.content && data.content.length > 0 ? (
          <Card
            withBorder={false}
            shadow="sm"
            radius="md"
            padding={0}
            style={{ overflow: 'hidden' }}
          >
            <Table verticalSpacing="md" horizontalSpacing="md" striped highlightOnHover>
              <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
                <Table.Tr>
                  <Table.Th>Pedido</Table.Th>
                  <Table.Th>Fecha</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th style={{ width: 140 }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.content.map((order) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <ThemeIcon variant="light" color={primaryColor} size="md" radius="md">
                          <IconPackage size={18} />
                        </ThemeIcon>
                        <Text fw={600}>#{order.orderNumber}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(order.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={ORDER_STATUS_COLORS[order.status] || 'gray'}
                        variant="light"
                        radius="sm"
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={700} style={{ color: primaryColor }}>
                        {formatCurrency(order.total)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <Button
                          variant="filled"
                          color="dark"
                          size="xs"
                          radius="md"
                          leftSection={<IconEye size={14} />}
                          onClick={() => handleViewOrder(order.id)}
                        >
                          Ver
                        </Button>
                        {['PENDING', 'AWAIT_PAYMENT'].includes(order.status) && (
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="md"
                            radius="md"
                            onClick={() => handleCancelOrder(order)}
                            title="Cancelar Pedido"
                          >
                            <IconX size={18} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {data.totalPages > 1 && (
              <Box p="md" style={{ borderTop: '1px solid #f1f3f5' }}>
                <Group justify="center">
                  <Pagination
                    value={page + 1}
                    onChange={(p) => setPage(p - 1)}
                    total={data.totalPages}
                    color={primaryColor}
                    radius="md"
                  />
                </Group>
              </Box>
            )}
          </Card>
        ) : (
          <Card withBorder radius="md" padding="xl" shadow="sm">
            <Center py={60}>
              <Stack align="center" gap="md">
                <ThemeIcon size={80} radius="circle" variant="light" color="gray">
                  <IconPackage size={48} />
                </ThemeIcon>
                <Title order={3} c="dimmed">No tienes pedidos</Title>
                <Text c="dimmed" ta="center" maw={400}>
                  Aún no has realizado ninguna compra. Explora nuestro catálogo
                  y encuentra los productos que necesitas.
                </Text>
                <Button
                  leftSection={<IconShoppingCart size={18} />}
                  onClick={() => navigate('/products')}
                  style={{ backgroundColor: primaryColor }}
                  size="md"
                  radius="md"
                >
                  Explorar Productos
                </Button>
              </Stack>
            </Center>
          </Card>
        )}
      </Stack>

      {/* Order Detail Modal */}
      <Modal
        opened={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        title={
          <Group gap="xs">
            <IconPackage size={20} color={primaryColor} />
            <Text fw={700} size="lg">Pedido #{orderDetail?.orderNumber || ''}</Text>
          </Group>
        }
        size="55%"
        padding="xl"
        radius="md"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{ title: { fontSize: '1.2rem' } }}
      >
        {detailLoading ? (
          <Center py={60}>
            <Loader color={primaryColor} />
          </Center>
        ) : orderDetail ? (
          <Stack gap="xl">
            {/* Status Stepper */}
            <Box py="md">
              <Text fw={600} mb="xl" size="lg">Estado del Pedido</Text>
              <Box style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                <Stepper
                  active={getStepperActiveStep(orderDetail.status)}
                  size="sm"
                  allowNextStepsSelect={false}
                  iconSize={50}
                  styles={{
                    steps: {
                      flexWrap: 'nowrap',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                    },
                    step: {
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: 0,
                    },
                    stepBody: {
                      marginLeft: 0,
                      marginTop: 12,
                    },
                    separator: {
                      height: 4,
                      minWidth: 20,
                      flex: 1,
                      marginTop: 23,
                      marginLeft: -45, // Pull separator under the wide text label to touch the icon
                      marginRight: -45, // Pull separator under the wide text label to touch the icon
                    },
                    stepIcon: {
                      borderWidth: 0,
                      position: 'relative',
                      zIndex: 1,
                    },
                  }}
                >
                  {[
                    { label: 'Pendiente', desc: 'Pedido creado', icon: IconClock, color: 'yellow' },
                    { label: 'Pago', desc: 'Pago registrado', icon: IconCash, color: 'green' },
                    { label: 'Comprobante', desc: 'Comprobante emitido', icon: IconReceipt, color: 'blue' },
                    { label: 'En Proceso', desc: 'Preparando pedido', icon: IconPackage, color: 'gray' }, // Using gray/cyan
                    { label: 'Enviado', desc: 'En camino', icon: IconTruck, color: 'indigo' },
                    { label: 'Entregado', desc: 'Pedido completado', icon: IconCheck, color: 'green' },
                  ].map((step, index) => {
                    const activeStep = getStepperActiveStep(orderDetail.status);
                    const isActive = activeStep === index;
                    const isInactive = activeStep < index;

                    let stepColor = step.color;
                    if (step.label === 'En Proceso' && !isInactive) stepColor = 'cyan';
                    if (step.label === 'Enviado' && !isInactive) stepColor = 'indigo';
                    if (step.label === 'Entregado' && !isInactive) stepColor = 'green';
                    if (isInactive) stepColor = 'gray';

                    return (
                      <Stepper.Step
                        key={index}
                        label={step.label}
                        description={step.desc}
                        icon={
                          <ThemeIcon
                            size={50}
                            radius="100%"
                            color={stepColor}
                            variant={isInactive ? 'light' : 'filled'}
                            style={isActive ? { boxShadow: `0 0 0 4px var(--mantine-color-${stepColor}-2)` } : undefined}
                          >
                            <step.icon size={26} />
                          </ThemeIcon>
                        }
                      />
                    );
                  })}
                </Stepper>
              </Box>
              {orderDetail.status === 'CANCELLED' && (
                <Alert color="red" mt="md" variant="light" icon={<IconX size={16} />}>
                  Este pedido ha sido cancelado.
                </Alert>
              )}
            </Box>

            <Divider />

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {/* Left Column: Products */}
              <Stack gap="lg">
                <Card withBorder radius="md" padding="md">
                  <Group justify="space-between" mb="sm">
                    <Text fw={600} size="lg">Productos</Text>
                  </Group>
                  <Divider mb="md" />
                  <Stack gap="md">
                    {orderDetail.items.map((item) => (
                      <Group key={item.id} justify="space-between" align="flex-start" wrap="nowrap">
                        <Group gap="sm" style={{ flex: 1 }}>
                          <ThemeIcon variant="light" color="gray" size="lg" radius="md">
                            <IconPackage size={24} />
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={600} lineClamp={2}>
                              {item.productName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              SKU: {item.sku}
                            </Text>
                          </div>
                        </Group>
                        <div style={{ textAlign: 'right' }}>
                          <Text size="sm" fw={500}>
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </Text>
                          <Text fw={700} style={{ color: primaryColor }}>
                            {formatCurrency(item.total)}
                          </Text>
                        </div>
                      </Group>
                    ))}
                  </Stack>

                  <Divider my="md" />

                  <Group justify="space-between">
                    <Text size="lg" fw={700}>Total</Text>
                    <Text size="xl" fw={800} style={{ color: primaryColor }}>
                      {formatCurrency(orderDetail.total)}
                    </Text>
                  </Group>
                </Card>
              </Stack>

              {/* Right Column: Addresses & Actions */}
              <Stack gap="lg">
                <SimpleGrid cols={1} spacing="md">
                  {/* Shipping Address */}
                  <Card withBorder radius="md" padding="md">
                    <Group mb="xs" gap="xs">
                      <IconMapPin size={18} color={primaryColor} />
                      <Text fw={600}>Dirección de Envío</Text>
                    </Group>
                    <Text size="sm" lh={1.5}>{orderDetail.shippingAddress.address}</Text>
                    {orderDetail.shippingAddress.reference && (
                      <Text size="xs" c="dimmed" mt={4}>
                        Ref: {orderDetail.shippingAddress.reference}
                      </Text>
                    )}

                    {orderDetail.shippingAddress.recipientName && (
                      <Text size="xs" c="dimmed" mt={4}>
                        {orderDetail.shippingAddress.recipientName}
                        {orderDetail.shippingAddress.recipientPhone ? ` - ${orderDetail.shippingAddress.recipientPhone}` : ''}
                      </Text>
                    )}
                  </Card>

                  {/* Billing Address */}
                  {orderDetail.billingAddress && (
                    <Card withBorder radius="md" padding="md">
                      <Group mb="xs" gap="xs">
                        <IconBuildingStore size={18} color={primaryColor} />
                        <Text fw={600}>Dirección de Facturación</Text>
                      </Group>
                      <Text size="sm" lh={1.5}>{orderDetail.billingAddress.address}</Text>
                    </Card>
                  )}
                </SimpleGrid>

                {/* Invoice Download */}
                {orderDetail.invoice && (
                  <Card withBorder radius="md" padding="md">
                    <Group mb="xs" gap="xs">
                      <IconReceipt size={18} color={primaryColor} />
                      <Text fw={600}>Comprobante de Pago</Text>
                    </Group>
                    <Group justify="space-between" align="center" mb="xs">
                      <Text size="sm" c="dimmed">
                        {orderDetail.invoice.invoiceType === 'INVOICE' ? 'Factura' : 'Boleta'}
                      </Text>
                      <Badge variant="light" color="green">Emitido</Badge>
                    </Group>
                    <Text size="lg" fw={700} mb="md">
                      {orderDetail.invoice.series}-{orderDetail.invoice.number}
                    </Text>
                    <Button
                      fullWidth
                      variant="light"
                      color="blue"
                      leftSection={<IconReceipt size={16} />}
                      onClick={handlePrint}
                    >
                      Imprimir Comprobante
                    </Button>
                    <div style={{ display: 'none' }}>
                      <StorefrontInvoicePrint
                        ref={componentRef}
                        invoice={orderDetail.invoice}
                        items={orderDetail.items}
                      />
                    </div>
                  </Card>
                )}

                {/* Cancel Button */}
                {['PENDING', 'AWAIT_PAYMENT'].includes(orderDetail.status) && (
                  <Button
                    fullWidth
                    color="red"
                    variant="light"
                    leftSection={<IconX size={16} />}
                    onClick={() => {
                      handleCancelOrder(orderDetail as any);
                      setSelectedOrderId(null);
                    }}
                  >
                    Cancelar Pedido
                  </Button>
                )}
              </Stack>
            </SimpleGrid>
          </Stack>
        ) : null}
      </Modal>
    </Container>
  );
};
