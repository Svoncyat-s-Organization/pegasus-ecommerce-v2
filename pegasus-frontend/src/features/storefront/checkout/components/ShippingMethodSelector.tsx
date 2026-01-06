import { Stack, Radio, Group, Text, Loader, Alert, Card, Badge, Box, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconTruck, IconClock, IconBuilding } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import { useShippingMethods } from '../hooks/useShippingMethods';
import type { CheckoutFormValues } from '../types/checkout.types';
import { useStorefrontConfigStore } from '@stores/storefront/configStore';
import { formatCurrency } from '@shared/utils/formatters';

interface ShippingMethodSelectorProps {
  form: UseFormReturnType<CheckoutFormValues>;
}

/**
 * ShippingMethodSelector Component
 * Selector de método de envío con mejor UX
 */
export const ShippingMethodSelector = ({ form }: ShippingMethodSelectorProps) => {
  const { data: shippingMethods, isLoading, error } = useShippingMethods();
  const { getPrimaryColor } = useStorefrontConfigStore();
  const primaryColor = getPrimaryColor();

  if (isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="md" />
        <Text c="dimmed">Cargando métodos de envío...</Text>
      </Group>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        No se pudieron cargar los métodos de envío. Por favor, recarga la página.
      </Alert>
    );
  }

  if (!shippingMethods || shippingMethods.length === 0) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Sin métodos disponibles" color="yellow">
        No hay métodos de envío disponibles en este momento.
      </Alert>
    );
  }

  const selectedId = form.values.shippingMethodId;

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Selecciona cómo deseas recibir tu pedido
      </Text>

      <Radio.Group
        {...form.getInputProps('shippingMethodId')}
        onChange={(value) => form.setFieldValue('shippingMethodId', Number(value))}
      >
        <Stack gap="sm">
          {shippingMethods.map((method) => {
            const isSelected = selectedId === method.id;
            const isFree = method.baseCost === 0;

            return (
              <Card
                key={method.id}
                withBorder
                radius="md"
                padding="md"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? primaryColor : undefined,
                  borderWidth: isSelected ? 2 : 1,
                  backgroundColor: isSelected ? `${primaryColor}08` : undefined,
                }}
                onClick={() => form.setFieldValue('shippingMethodId', method.id)}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="md" wrap="nowrap">
                    <Radio value={String(method.id)} />
                    <ThemeIcon
                      size="lg"
                      variant="light"
                      color={isSelected ? 'blue' : 'gray'}
                      radius="xl"
                    >
                      <IconTruck size={18} />
                    </ThemeIcon>
                    <Box>
                      <Group gap="xs" mb={4}>
                        <Text fw={600}>{method.name}</Text>
                        {isFree && (
                          <Badge color="green" variant="light" size="sm">
                            Gratis
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed" mb={6}>
                        {method.description}
                      </Text>
                      <Group gap="md">
                        <Group gap={4}>
                          <IconClock size={14} color="#868e96" />
                          <Text size="xs" c="dimmed">
                            {method.estimatedDaysMin === method.estimatedDaysMax
                              ? `${method.estimatedDaysMin} ${method.estimatedDaysMin === 1 ? 'día' : 'días'}`
                              : `${method.estimatedDaysMin}-${method.estimatedDaysMax} días`}
                          </Text>
                        </Group>
                        <Group gap={4}>
                          <IconBuilding size={14} color="#868e96" />
                          <Text size="xs" c="dimmed">
                            {method.carrier}
                          </Text>
                        </Group>
                      </Group>
                    </Box>
                  </Group>
                  <Text
                    size="lg"
                    fw={700}
                    style={{ color: isFree ? 'var(--mantine-color-green-6)' : primaryColor }}
                  >
                    {isFree ? 'Gratis' : formatCurrency(method.baseCost)}
                  </Text>
                </Group>
              </Card>
            );
          })}
        </Stack>
      </Radio.Group>
    </Stack>
  );
};
