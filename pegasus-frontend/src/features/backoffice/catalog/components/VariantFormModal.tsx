import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';
import { IconPlus } from '@tabler/icons-react';
import type { VariantResponse, CreateVariantRequest, UpdateVariantRequest } from '@types';
import { useCreateVariant, useUpdateVariant } from '../hooks/useVariants';

interface VariantFormModalProps {
  open: boolean;
  onCancel: () => void;
  productId: number;
  variant?: VariantResponse;
}

export const VariantFormModal = ({ open, onCancel, productId, variant }: VariantFormModalProps) => {
  const [form] = Form.useForm();
  const isEdit = !!variant;

  const createMutation = useCreateVariant();
  const updateMutation = useUpdateVariant();

  useEffect(() => {
    if (open && variant) {
      form.setFieldsValue({
        sku: variant.sku,
        price: variant.price,
        attributes: JSON.stringify(variant.attributes || {}, null, 2),
      });
    } else if (open && !variant) {
      form.resetFields();
    }
  }, [open, variant, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Parsear atributos JSON
      let attributes = {};
      if (values.attributes) {
        try {
          attributes = JSON.parse(values.attributes);
        } catch {
          form.setFields([{ name: 'attributes', errors: ['JSON inválido'] }]);
          return;
        }
      }

      const payload = {
        ...values,
        attributes,
      };

      if (isEdit && variant) {
        await updateMutation.mutateAsync({ id: variant.id, request: payload as UpdateVariantRequest });
      } else {
        await createMutation.mutateAsync({ ...payload, productId } as CreateVariantRequest);
      }

      form.resetFields();
      onCancel();
    } catch {
      // Errores de validación o del servidor ya manejados
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar Variante' : 'Nueva Variante'}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          icon={<IconPlus size={16} />}
        >
          {isEdit ? 'Actualizar' : 'Crear'}
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="SKU"
          name="sku"
          rules={[
            { required: true, message: 'SKU es requerido' },
            { max: 50, message: 'Máximo 50 caracteres' },
          ]}
        >
          <Input placeholder="VAR-001-BLUE-L" />
        </Form.Item>

        <Form.Item
          label="Precio"
          name="price"
          rules={[
            { required: true, message: 'Precio es requerido' },
            { type: 'number', min: 0, message: 'Precio debe ser mayor o igual a 0' },
          ]}
        >
          <InputNumber
            placeholder="99.99"
            style={{ width: '100%' }}
            precision={2}
            min={0}
            addonBefore="S/"
          />
        </Form.Item>

        <Form.Item
          label="Atributos (JSON)"
          name="attributes"
          extra={'Formato: { "color": "Azul", "talla": "L" }'}
        >
          <Input.TextArea
            rows={6}
            placeholder={'{"color": "Azul", "talla": "L", "material": "Algodón"}'}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
