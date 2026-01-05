import { Card, Group, Image, Text, NumberInput, ActionIcon, Stack, Badge } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { CartItem as CartItemType } from '../types/cart.types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

/**
 * CartItem Component
 * Muestra un item individual del carrito con controles de cantidad
 */
export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const subtotal = item.price * item.quantity;

  return (
    <Card withBorder padding="md">
      <Group align="flex-start" gap="md">
        {/* Imagen del producto */}
        <Image
          src={item.imageUrl || 'https://placehold.co/120x120/E5E5EA/000000/png?text=Sin+Imagen'}
          alt={item.productName}
          width={120}
          height={120}
          fit="contain"
        />

        {/* Información del producto */}
        <Stack flex={1} gap="xs">
          <div>
            <Text size="lg" fw={600}>
              {item.productName}
            </Text>
            <Text size="sm" c="dimmed">
              {item.brandName} | SKU: {item.sku}
            </Text>
          </div>

          {/* Atributos de la variante */}
          {Object.keys(item.attributes).length > 0 && (
            <Group gap="xs">
              {Object.entries(item.attributes).map(([key, value]) => (
                <Badge key={key} variant="light" color="blue" size="sm">
                  {key}: {value}
                </Badge>
              ))}
            </Group>
          )}

          {/* Precio unitario */}
          <Text size="sm" c="dimmed">
            Precio unitario: <Text component="span" fw={500}>S/ {item.price.toFixed(2)}</Text>
          </Text>
        </Stack>

        {/* Controles de cantidad y precio */}
        <Stack align="flex-end" gap="sm" style={{ minWidth: 160 }}>
          {/* Subtotal */}
          <div style={{ textAlign: 'right' }}>
            <Text size="xs" c="dimmed">
              Subtotal
            </Text>
            <Text size="xl" fw={700} c="blue">
              S/ {subtotal.toFixed(2)}
            </Text>
          </div>

          {/* Control de cantidad */}
          <Group gap="xs">
            <NumberInput
              value={item.quantity}
              onChange={(value) => onUpdateQuantity(item.id, Number(value) || 1)}
              min={1}
              max={99}
              size="sm"
              style={{ width: 80 }}
              hideControls={false}
            />
            <ActionIcon
              color="red"
              variant="light"
              size="lg"
              onClick={() => onRemove(item.id)}
              title="Eliminar"
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
