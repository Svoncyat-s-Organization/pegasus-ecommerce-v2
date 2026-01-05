import { TextInput, PasswordInput, Button, Paper, Title, Text, Anchor, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import type { LoginRequest } from '@types';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const { login, isLoginPending } = useCustomerAuth();

  const form = useForm<LoginRequest>({
    initialValues: {
      usernameOrEmail: '',
      password: '',
    },
    validate: {
      usernameOrEmail: (value) => {
        if (!value) return 'Usuario o email es requerido';
      },
      password: (value) => {
        if (!value) return 'La contraseña es requerida';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
      },
    },
  });

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await login(values);
    } catch (error) {
      // Error handled in useCustomerAuth hook
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder>
      <Title order={2} ta="center" mb="md">
        Iniciar Sesión
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="xl">
        Ingresa con tu cuenta de cliente
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Usuario o Email"
            placeholder="usuario o tu@email.com"
            required
            {...form.getInputProps('usernameOrEmail')}
          />

          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            required
            {...form.getInputProps('password')}
          />

          <Button type="submit" fullWidth loading={isLoginPending}>
            Iniciar Sesión
          </Button>
        </Stack>
      </form>

      {onSwitchToRegister && (
        <Text ta="center" mt="md" size="sm">
          ¿No tienes cuenta?{' '}
          <Anchor component="button" type="button" onClick={onSwitchToRegister}>
            Regístrate aquí
          </Anchor>
        </Text>
      )}
    </Paper>
  );
};
