import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { useModule } from '../../hooks/useModules';
import { useCreateModule, useUpdateModule } from '../../hooks/useModuleMutations';
import { MODULE_FORM_RULES } from '../../constants/rbacConstants';
import type { CreateModuleRequest, UpdateModuleRequest } from '@types';

interface ModuleFormModalProps {
  mode: 'create' | 'edit';
  moduleId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const ModuleFormModal = ({ mode, moduleId, visible, onClose }: ModuleFormModalProps) => {
  const [form] = Form.useForm();
  
  const { data: module } = useModule(moduleId || 0, {
    enabled: mode === 'edit' && !!moduleId && visible,
  });
  
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();

  const isSubmitting = createModule.isPending || updateModule.isPending;

  useEffect(() => {
    if (mode === 'edit' && module && visible) {
      form.setFieldsValue(module);
    } else if (mode === 'create' && visible) {
      form.resetFields();
    }
  }, [module, mode, visible, form]);

  const handleFinish = (values: CreateModuleRequest | UpdateModuleRequest) => {
    if (mode === 'create') {
      createModule.mutate(values as CreateModuleRequest, {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      });
    } else if (moduleId) {
      updateModule.mutate(
        { id: moduleId, moduleData: values as UpdateModuleRequest },
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
      title={mode === 'create' ? 'Crear Módulo' : 'Editar Módulo'}
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
          label="Nombre del Módulo"
          name="name"
          rules={MODULE_FORM_RULES.name}
        >
          <Input placeholder="Ej: Catálogo, Inventario, etc." />
        </Form.Item>

        <Form.Item
          label="Ruta"
          name="path"
          rules={MODULE_FORM_RULES.path}
        >
          <Input placeholder="/admin/catalog/products" />
        </Form.Item>

        <Form.Item
          label="Ícono (opcional)"
          name="icon"
          rules={MODULE_FORM_RULES.icon}
        >
          <Input placeholder="IconShoppingCart" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
