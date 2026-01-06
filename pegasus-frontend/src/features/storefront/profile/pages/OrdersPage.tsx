import { useState } from 'react';
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
} from '@mantine/core';
import {
  IconPackage,
  IconEye,
  IconX,
  IconShoppingCart,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useMyOrders, useMyOrderDetail, useCancelMyOrder } from '../hooks/useOrders';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { formatCurrency, formatDate } from '@shared/utils/formatters';
import type { OrderSummaryResponse } from '@types';

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

  if (isLoading) {
    return (
      <Center py={100}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Mis Pedidos</Title>
            <Text c="dimmed">Historial y seguimiento de tus compras</Text>
          </div>
        </Group>

        {/* Orders List */}
        {data?.content && data.content.length > 0 ? (
          <Card withBorder radius="md" padding={0}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Pedido</Table.Th>
                  <Table.Th>Fecha</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th style={{ width: 120 }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.content.map((order) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>
                      <Text fw={500}>#{order.orderNumber}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(order.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={ORDER_STATUS_COLORS[order.status] || 'gray'}
                        variant="light"
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} style={{ color: primaryColor }}>
                        {formatCurrency(order.total)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          variant="subtle"
                          size="xs"
                          leftSection={<IconEye size={14} />}
                          onClick={() => handleViewOrder(order.id)}
                        >
                          Ver
                        </Button>
                        {['PENDING', 'AWAIT_PAYMENT'].includes(order.status) && (
                          <Button
                            variant="subtle"
                            color="red"
                            size="xs"
                            leftSection={<IconX size={14} />}
                            onClick={() => handleCancelOrder(order)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {data.totalPages > 1 && (
              <Box p="md" style={{ borderTop: '1px solid #e9ecef' }}>
                <Group justify="center">
                  <Pagination
                    value={page + 1}
                    onChange={(p) => setPage(p - 1)}
                    total={data.totalPages}
                  />
                </Group>
              </Box>
            )}
          </Card>
        ) : (
          <Card withBorder radius="md" padding="xl">
            <Center py={60}>
              <Stack align="center" gap="md">
                <IconPackage size={64} color="#adb5bd" />
                <Title order={3} c="dimmed">No tienes pedidos</Title>
                <Text c="dimmed" ta="center" maw={400}>
                  Aún no has realizado ninguna compra. Explora nuestro catálogo
                  y encuentra los productos que necesitas.
                </Text>
                <Button
                  leftSection={<IconShoppingCart size={18} />}
                  onClick={() => navigate('/products')}
                  style={{ backgroundColor: primaryColor }}
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
        title={`Pedido #${orderDetail?.orderNumber || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <Center py={40}>
            <Loader />
          </Center>
        ) : orderDetail ? (
          <Stack gap="md">
            <Group justify="space-between">
              <Badge
                color={ORDER_STATUS_COLORS[orderDetail.status] || 'gray'}
                variant="light"
                size="lg"
              >
                {ORDER_STATUS_LABELS[orderDetail.status] || orderDetail.status}
              </Badge>
              <Text size="sm" c="dimmed">
                {formatDate(orderDetail.createdAt)}
              </Text>
            </Group>

            <Divider />

            <Title order={5}>Productos</Title>
            <Stack gap="xs">
              {orderDetail.items.map((item) => (
                <Group key={item.id} justify="space-between" wrap="nowrap">
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {item.productName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      SKU: {item.sku} | Cantidad: {item.quantity}
                    </Text>
                  </div>
                  <Text size="sm" fw={600}>
                    {formatCurrency(item.total)}
                  </Text>
                </Group>
              ))}
            </Stack>

            <Divider />

            <Group justify="space-between">
              <Text size="lg" fw={700}>Total</Text>
              <Text size="lg" fw={700} style={{ color: primaryColor }}>
                {formatCurrency(orderDetail.total)}
              </Text>
            </Group>

            <Divider />

            <Title order={5}>Dirección de Envío</Title>
            <Card withBorder radius="sm" padding="sm" style={{ backgroundColor: '#fafafa' }}>
              <Text size="sm">{orderDetail.shippingAddress.address}</Text>
              {orderDetail.shippingAddress.reference && (
                <Text size="xs" c="dimmed">Ref: {orderDetail.shippingAddress.reference}</Text>
              )}
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </Container>
  );
};
