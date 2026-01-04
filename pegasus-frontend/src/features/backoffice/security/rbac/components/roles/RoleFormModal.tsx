import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { useRole } from '../../hooks/useRoles';
import { useCreateRole, useUpdateRole } from '../../hooks/useRoleMutations';
import { ROLE_FORM_RULES } from '../../constants/rbacConstants';
import type { CreateRoleRequest, UpdateRoleRequest } from '@types';

interface RoleFormModalProps {
  mode: 'create' | 'edit';
  roleId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const RoleFormModal = ({ mode, roleId, visible, onClose }: RoleFormModalProps) => {
  const [form] = Form.useForm();
  
  const { data: role } = useRole(roleId || 0, {
    enabled: mode === 'edit' && !!roleId && visible,
  });
  
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const isSubmitting = createRole.isPending || updateRole.isPending;

  useEffect(() => {
    if (mode === 'edit' && role && visible) {
      form.setFieldsValue(role);
    } else if (mode === 'create' && visible) {
      form.resetFields();
    }
  }, [role, mode, visible, form]);

  const handleFinish = (values: CreateRoleRequest | UpdateRoleRequest) => {
    if (mode === 'create') {
      createRole.mutate(values as CreateRoleRequest, {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      });
    } else if (roleId) {
      updateRole.mutate(
        { id: roleId, roleData: values as UpdateRoleRequest },
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
      title={mode === 'create' ? 'Crear Rol' : 'Editar Rol'}
      open={visible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={isSubmitting}
      okText={mode === 'create' ? 'Crear' : 'Actualizar'}
      cancelText="Cancelar"
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        disabled={isSubmitting}
      >
        <Form.Item
          label="Nombre del Rol"
          name="name"
          rules={ROLE_FORM_RULES.name}
        >
          <Input placeholder="Ej: Administrador, Vendedor, etc." />
        </Form.Item>

        <Form.Item
          label="Descripción"
          name="description"
          rules={ROLE_FORM_RULES.description}
        >
          <Input.TextArea
            placeholder="Descripción breve del rol y sus responsabilidades"
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
