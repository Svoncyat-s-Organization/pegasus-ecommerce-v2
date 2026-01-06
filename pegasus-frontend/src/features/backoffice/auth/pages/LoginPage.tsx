import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert, theme } from 'antd';
import { IconLock, IconMail } from '@tabler/icons-react';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '@types';

const { Title, Text } = Typography;
const { useToken } = theme;

export const LoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useToken();

  const onFinish = async (values: LoginRequest) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(values);
      message.success('Inicio de sesión exitoso');
      navigate('/admin/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      message.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: token.colorBgLayout,
        transition: 'background 0.3s ease',
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: 15,
          border: '1px solid #303030',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 8, fontWeight: 600 }}>
            Pegasus Backoffice
          </Title>
          <Text type="secondary">Ingresa a tu cuenta</Text>
        </div>

        <Alert
          title="Credenciales de Prueba"
          description={
            <div style={{ fontSize: '13px' }}>
              <div>Usuario o Email: admin@pegasus.com (o admin)</div>
              <div>Contraseña: clave123</div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="Usuario o Email"
            name="usernameOrEmail"
            rules={[
              { required: true, message: 'Por favor ingresa tu usuario o email' },
            ]}
          >
            <Input
              prefix={<IconMail size={18} style={{ color: '#bfbfbf' }} />}
              placeholder="usuario o correo@ejemplo.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
          >
            <Input.Password
              prefix={<IconLock size={18} style={{ color: '#bfbfbf' }} />}
              placeholder="Ingresa tu contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
              style={{ marginTop: 8 }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
