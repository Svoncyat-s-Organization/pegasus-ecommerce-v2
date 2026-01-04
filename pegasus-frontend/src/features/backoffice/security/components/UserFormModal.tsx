import { useEffect } from 'react';
import { Form, Input, Select, Modal, Row, Col } from 'antd';
import { useUser } from '../hooks/useUsers';
import { useCreateUser, useUpdateUser } from '../hooks/useUserMutations';
import { DOCUMENT_TYPES, PASSWORD_RULES } from '../constants/userConstants';
import type { CreateUserRequest, UpdateUserRequest } from '@types';

interface UserFormModalProps {
  mode: 'create' | 'edit';
  userId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const UserFormModal = ({ mode, userId, visible, onClose }: UserFormModalProps) => {
  const [form] = Form.useForm();
  
  const { data: user } = useUser(userId || 0, {
    enabled: mode === 'edit' && !!userId && visible,
  });
  
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const isSubmitting = createUser.isPending || updateUser.isPending;

  useEffect(() => {
    if (mode === 'edit' && user && visible) {
      form.setFieldsValue(user);
    } else if (mode === 'create' && visible) {
      form.resetFields();
    }
  }, [user, mode, visible, form]);

  const handleFinish = (values: CreateUserRequest | UpdateUserRequest) => {
    if (mode === 'create') {
      createUser.mutate(values as CreateUserRequest, {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      });
    } else if (mode === 'edit' && userId) {
      updateUser.mutate(
        { id: userId, userData: values as UpdateUserRequest },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      okText={mode === 'create' ? 'Crear' : 'Guardar'}
      cancelText="Cancelar"
      width={750}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
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
              <Input placeholder="Ej: jperez" />
            </Form.Item>
          </Col>
          <Col span={12}>
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
          </Col>
        </Row>

        {mode === 'create' && (
          <Row gutter={16}>
            <Col span={12}>
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
                extra={PASSWORD_RULES.hint}
              >
                <Input.Password placeholder="********" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
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
          </Col>
          <Col span={12}>
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
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
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
          </Col>
          <Col span={8}>
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
          </Col>
          <Col span={8}>
            <Form.Item
              label="Teléfono"
              name="phone"
              rules={[
                {
                  pattern: /^9\d{8}$/,
                  message: 'Debe ser 9 dígitos e iniciar con 9',
                },
              ]}
            >
              <Input 
                placeholder="987654321" 
                addonBefore="+51"
                maxLength={9}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
