import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import { useChangePassword } from '../hooks/useUserMutations';
import { PASSWORD_RULES } from '../constants/userConstants';
import type { ChangePasswordRequest } from '@types';

interface ChangePasswordModalProps {
  userId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ userId, visible, onClose }: ChangePasswordModalProps) => {
  const [form] = Form.useForm();
  const changePassword = useChangePassword();

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleFinish = (values: ChangePasswordRequest) => {
    if (!userId) return;

    changePassword.mutate(
      { id: userId, passwordData: values },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      title="Cambiar Contraseña"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={changePassword.isPending}
      okText="Cambiar"
      cancelText="Cancelar"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} autoComplete="off">
        <Form.Item
          label="Nueva Contraseña"
          name="newPassword"
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
          <Input.Password placeholder="********" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
