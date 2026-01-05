import { Container, Grid, Stack, Title, Text, Button, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { CartItem } from '../components/CartItem';
import { CartSummary } from '../components/CartSummary';
import { EmptyCart } from '../components/EmptyCart';
import { useCartStore } from '../store/cartStore';

/**
 * CartPage - Página principal del carrito de compras
 * Muestra items, permite editar cantidades y proceder al checkout
 */
export const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalItems, getSubtotal, getIGV, getTotal } =
    useCartStore();

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const igv = getIGV();
  const total = getTotal();

  // Confirmar limpieza del carrito
  const handleClearCart = () => {
    modals.openConfirmModal({
      title: 'Vaciar Carrito',
      children: <Text size="sm">¿Estás seguro de que deseas eliminar todos los productos del carrito?</Text>,
      labels: { confirm: 'Vaciar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: clearCart,
    });
  };

  // Si el carrito está vacío, mostrar EmptyCart
  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>Mi Carrito</Title>
            <Text size="sm" c="dimmed">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito
            </Text>
          </div>
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={18} />}
            onClick={handleClearCart}
          >
            Vaciar Carrito
          </Button>
        </Group>

        {/* Grid: Items (8 cols) + Summary (4 cols) */}
        <Grid gutter="xl">
          {/* Lista de items */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </Stack>
          </Grid.Col>

          {/* Resumen del pedido */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <div style={{ position: 'sticky', top: 80 }}>
              <CartSummary subtotal={subtotal} igv={igv} total={total} itemCount={totalItems} />
            </div>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};
