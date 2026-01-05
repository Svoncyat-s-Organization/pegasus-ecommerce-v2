import { useEffect } from 'react';
import { Form, Input, Select, Button, Card, Space, Typography } from 'antd';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { DOCUMENT_TYPES, PASSWORD_RULES } from '../constants/userConstants';
import type { CreateUserRequest, UpdateUserRequest, UserDetail } from '@types';

const { Title } = Typography;

interface UserFormProps {
  mode: 'create' | 'edit';
  initialValues?: UserDetail;
  onSubmit: (values: CreateUserRequest | UpdateUserRequest) => void;
  isLoading?: boolean;
}

export const UserForm = ({ mode, initialValues, onSubmit, isLoading }: UserFormProps) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, mode, form]);

  const handleFinish = (values: CreateUserRequest | UpdateUserRequest) => {
    onSubmit(values);
  };

  const handleCancel = () => {
    navigate('/admin/security/users');
  };

  return (
    <Card>
      <Title level={4}>{mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
        style={{ maxWidth: 800 }}
      >
        <Form.Item
          label="Nombre de Usuario"
          name="username"
          rules={[
            { required: true, message: 'El nombre de usuario es obligatorio' },
            { min: 3, message: 'Mínimo 3 caracteres' },
            { max: 20, message: 'Máximo 20 caracteres' },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: 'Solo letras, números y guiones bajos',
            },
          ]}
        >
          <Input placeholder="Ej: jperez" disabled={mode === 'edit'} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'El email es obligatorio' },
            { type: 'email', message: 'Email inválido' },
          ]}
        >
          <Input placeholder="usuario@empresa.com" />
        </Form.Item>

        {mode === 'create' && (
          <>
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: 'La contraseña es obligatoria' },
                { min: PASSWORD_RULES.minLength, message: `Mínimo ${PASSWORD_RULES.minLength} caracteres` },
                {
                  pattern: PASSWORD_RULES.pattern,
                  message: 'Debe contener mayúsculas, minúsculas, números y símbolos',
                },
              ]}
            >
              <Input.Password placeholder="********" />
            </Form.Item>

            <Form.Item
              label="Confirmar Contraseña"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirme la contraseña' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="********" />
            </Form.Item>
          </>
        )}

        <Form.Item
          label="Tipo de Documento"
          name="docType"
          rules={[{ required: true, message: 'Seleccione el tipo de documento' }]}
        >
          <Select placeholder="Seleccionar">
            {DOCUMENT_TYPES.map((type) => (
              <Select.Option key={type.value} value={type.value}>
                {type.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Número de Documento"
          name="docNumber"
          rules={[
            { required: true, message: 'El número de documento es obligatorio' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const docType = getFieldValue('docType');
                if (!value) return Promise.resolve();

                if (docType === 'DNI') {
                  if (!/^\d{8}$/.test(value)) {
                    return Promise.reject(new Error('DNI debe tener 8 dígitos'));
                  }
                } else if (docType === 'CE') {
                  if (!/^[a-zA-Z0-9]{9,12}$/.test(value)) {
                    return Promise.reject(new Error('CE debe tener entre 9 y 12 caracteres alfanuméricos'));
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input placeholder="Ej: 12345678" />
        </Form.Item>

        <Form.Item
          label="Nombre"
          name="firstName"
          rules={[
            { required: true, message: 'El nombre es obligatorio' },
            { min: 2, message: 'Mínimo 2 caracteres' },
          ]}
        >
          <Input placeholder="Juan" />
        </Form.Item>

        <Form.Item
          label="Apellido"
          name="lastName"
          rules={[
            { required: true, message: 'El apellido es obligatorio' },
            { min: 2, message: 'Mínimo 2 caracteres' },
          ]}
        >
          <Input placeholder="Pérez" />
        </Form.Item>

        <Form.Item
          label="Teléfono"
          name="phone"
          rules={[
            {
              pattern: /^9\d{8}$/,
              message: 'Formato inválido (9 dígitos, inicia con 9)',
            },
          ]}
        >
          <Input placeholder="987654321" maxLength={9} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<IconDeviceFloppy size={18} />}
              loading={isLoading}
            >
              {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
            </Button>
            <Button icon={<IconX size={18} />} onClick={handleCancel}>
              Cancelar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};
