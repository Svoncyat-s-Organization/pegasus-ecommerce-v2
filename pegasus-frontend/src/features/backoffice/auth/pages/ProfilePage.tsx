import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Select, Divider, Space, Spin } from 'antd';
import { IconUser, IconLock, IconDeviceFloppy } from '@tabler/icons-react';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile, useChangePassword } from '../hooks/useUpdateProfile';
import type { UpdateUserRequest, ChangePasswordRequest, DocumentType } from '@types';

const { Title, Text } = Typography;
const { Option } = Select;

export const ProfilePage = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const handleUpdateProfile = async (values: UpdateUserRequest) => {
    await updateProfile.mutateAsync(values);
    setIsEditingProfile(false);
  };

  const handleChangePassword = async (values: ChangePasswordRequest) => {
    await changePassword.mutateAsync(values);
    passwordForm.resetFields();
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <IconUser size={28} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Mi Perfil
      </Title>

      {/* Información del Perfil */}
      <Card
        title={
          <Space>
            <IconUser size={20} />
            <Text strong>Información Personal</Text>
          </Space>
        }
        extra={
          !isEditingProfile && (
            <Button type="link" onClick={() => setIsEditingProfile(true)}>
              Editar
            </Button>
          )
        }
        style={{ marginBottom: 24 }}
      >
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={profile}
          onFinish={handleUpdateProfile}
          disabled={!isEditingProfile}
        >
          <Form.Item
            label="Nombre de Usuario"
            name="username"
            rules={[
              { required: true, message: 'El nombre de usuario es requerido' },
              { min: 3, message: 'Debe tener al menos 3 caracteres' },
              { max: 50, message: 'No puede exceder 50 caracteres' },
            ]}
          >
            <Input placeholder="admin123" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'El email es requerido' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input placeholder="admin@pegasus.com" />
          </Form.Item>

          <Form.Item
            label="Tipo de Documento"
            name="docType"
            rules={[{ required: true, message: 'El tipo de documento es requerido' }]}
          >
            <Select placeholder="Seleccione tipo de documento">
              <Option value="DNI">DNI</Option>
              <Option value="CE">Carné de Extranjería</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Número de Documento"
            name="docNumber"
            rules={[
              { required: true, message: 'El número de documento es requerido' },
              {
                validator: (_, value) => {
                  const docType = profileForm.getFieldValue('docType') as DocumentType;
                  if (!value) return Promise.resolve();

                  if (docType === 'DNI') {
                    if (!/^\d{8}$/.test(value)) {
                      return Promise.reject('DNI debe tener exactamente 8 dígitos');
                    }
                  } else if (docType === 'CE') {
                    if (!/^[A-Za-z0-9]{9,12}$/.test(value)) {
                      return Promise.reject('CE debe tener entre 9 y 12 caracteres alfanuméricos');
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="12345678" maxLength={20} />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="firstName"
            rules={[
              { required: true, message: 'El nombre es requerido' },
              { max: 100, message: 'No puede exceder 100 caracteres' },
            ]}
          >
            <Input placeholder="Juan" />
          </Form.Item>

          <Form.Item
            label="Apellido"
            name="lastName"
            rules={[
              { required: true, message: 'El apellido es requerido' },
              { max: 100, message: 'No puede exceder 100 caracteres' },
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
                message: 'Debe ser 9 dígitos e iniciar con 9',
              },
            ]}
          >
            <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
          </Form.Item>

          <Form.Item name="isActive" hidden>
            <Input />
          </Form.Item>

          {isEditingProfile && (
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<IconDeviceFloppy size={18} />}
                  loading={updateProfile.isPending}
                >
                  Guardar Cambios
                </Button>
                <Button onClick={() => {
                  setIsEditingProfile(false);
                  profileForm.setFieldsValue(profile);
                }}>
                  Cancelar
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Card>

      {/* Cambiar Contraseña */}
      <Card
        title={
          <Space>
            <IconLock size={20} />
            <Text strong>Cambiar Contraseña</Text>
          </Space>
        }
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Nueva Contraseña"
            name="newPassword"
            rules={[
              { required: true, message: 'La contraseña es requerida' },
              { min: 6, message: 'Debe tener al menos 6 caracteres' },
            ]}
          >
            <Input.Password placeholder="Ingrese nueva contraseña" />
          </Form.Item>

          <Form.Item
            label="Confirmar Contraseña"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Confirme la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirme nueva contraseña" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<IconLock size={18} />}
              loading={changePassword.isPending}
            >
              Actualizar Contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
