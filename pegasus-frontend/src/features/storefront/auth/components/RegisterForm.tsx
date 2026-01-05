import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Stack,
  Group,
  Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import type { RegisterCustomerRequest } from '@types';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const { register, isRegisterPending } = useCustomerAuth();

  const form = useForm<RegisterCustomerRequest>({
    initialValues: {
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      docType: 'DNI',
      docNumber: '',
      phone: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'El correo es requerido';
        if (!/^\S+@\S+$/.test(value)) return 'Correo electrónico inválido';
      },
      username: (value) => {
        if (!value) return 'El usuario es requerido';
        if (value.length < 3) return 'El usuario debe tener al menos 3 caracteres';
      },
      password: (value) => {
        if (!value) return 'La contraseña es requerida';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
      },
      firstName: (value) => (!value ? 'El nombre es requerido' : null),
      lastName: (value) => (!value ? 'El apellido es requerido' : null),
      docNumber: (value) => (!value ? 'El número de documento es requerido' : null),
      phone: (value) => {
        if (value && !/^9\d{8}$/.test(value)) {
          return 'Debe ser 9 dígitos e iniciar con 9';
        }
      },
    },
  });

  const handleSubmit = async (values: RegisterCustomerRequest) => {
    try {
      // Remove phone if empty
      const payload = {
        ...values,
        phone: values.phone || undefined,
      };
      await register(payload);
    } catch (error) {
      // Error handled in useCustomerAuth hook
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder>
      <Title order={2} ta="center" mb="md">
        Crear Cuenta
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        Regístrate para empezar a comprar
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Nombre"
              placeholder="Juan"
              required
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label="Apellido"
              placeholder="Pérez"
              required
              {...form.getInputProps('lastName')}
            />
          </Group>

          <Group grow>
            <Select
              label="Tipo de Documento"
              placeholder="Selecciona"
              required
              data={[
                { value: 'DNI', label: 'DNI' },
                { value: 'CE', label: 'Carné de Extranjería' },
              ]}
              {...form.getInputProps('docType')}
            />
            <TextInput
              label="Número de Documento"
              placeholder={form.values.docType === 'DNI' ? '12345678' : 'ABC123456'}
              required
              maxLength={form.values.docType === 'DNI' ? 8 : 12}
              {...form.getInputProps('docNumber')}
            />
          </Group>

          <TextInput
            label="Teléfono"
            placeholder="987654321"
            leftSection={<Text size="sm">+51</Text>}
            maxLength={9}
            {...form.getInputProps('phone')}
          />

          <TextInput
            label="Usuario"
            placeholder="juanperez"
            required
            {...form.getInputProps('username')}
          />

          <TextInput
            label="Correo electrónico"
            placeholder="tu@email.com"
            required
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            required
            {...form.getInputProps('password')}
          />

          <Button type="submit" fullWidth loading={isRegisterPending}>
            Registrarse
          </Button>
        </Stack>
      </form>

      {onSwitchToLogin && (
        <Text ta="center" mt="md" size="sm">
          ¿Ya tienes cuenta?{' '}
          <Anchor component="button" type="button" onClick={onSwitchToLogin}>
            Inicia sesión aquí
          </Anchor>
        </Text>
      )}
    </Paper>
  );
};
