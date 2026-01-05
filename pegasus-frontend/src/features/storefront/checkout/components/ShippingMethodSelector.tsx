import { Stack, Radio, Group, Text, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import { useShippingMethods } from '../hooks/useShippingMethods';
import type { CheckoutFormValues } from '../types/checkout.types';

interface ShippingMethodSelectorProps {
  form: UseFormReturnType<CheckoutFormValues>;
}

/**
 * ShippingMethodSelector Component
 * Selector de método de envío
 */
export const ShippingMethodSelector = ({ form }: ShippingMethodSelectorProps) => {
  const { data: shippingMethods, isLoading, error } = useShippingMethods();

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

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Selecciona un método de envío para tu pedido
      </Text>

      <Radio.Group
        {...form.getInputProps('shippingMethodId')}
        onChange={(value) => form.setFieldValue('shippingMethodId', Number(value))}
      >
        <Stack gap="sm">
          {shippingMethods.map((method) => (
            <Radio
              key={method.id}
              value={String(method.id)}
              label={
                <Group justify="space-between" style={{ width: '100%' }}>
                  <div>
                    <Text fw={500}>{method.name}</Text>
                    <Text size="xs" c="dimmed">
                      {method.description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {method.estimatedDaysMin === method.estimatedDaysMax
                        ? `Entrega: ${method.estimatedDaysMin} ${method.estimatedDaysMin === 1 ? 'día' : 'días'}`
                        : `Entrega: ${method.estimatedDaysMin}-${method.estimatedDaysMax} días`}
                    </Text>
                    <Text size="xs" c="dimmed" fw={500}>
                      {method.carrier}
                    </Text>
                  </div>
                  <Text fw={600} c="blue">
                    S/ {method.baseCost.toFixed(2)}
                  </Text>
                </Group>
              }
              styles={{
                label: { width: '100%', cursor: 'pointer' },
                body: { alignItems: 'flex-start' },
              }}
            />
          ))}
        </Stack>
      </Radio.Group>
    </Stack>
  );
};
