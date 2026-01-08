import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Select, Typography, Alert } from 'antd';
import { IconPlus } from '@tabler/icons-react';
import type { VariantResponse, CreateVariantRequest, UpdateVariantRequest } from '@types';
import { useCreateVariant, useUpdateVariant } from '../hooks/useVariants';
import { useProductVariantAttributes } from '../hooks/useProductVariantAttributes';

const { Text } = Typography;

interface VariantFormModalProps {
  open: boolean;
  onCancel: () => void;
  productId: number;
  variant?: VariantResponse;
}

export const VariantFormModal = ({ open, onCancel, productId, variant }: VariantFormModalProps) => {
  const [form] = Form.useForm();
  const isEdit = !!variant;

  const { data: productAttributes, isLoading: isLoadingAttributes } = useProductVariantAttributes(productId);
  const createMutation = useCreateVariant();
  const updateMutation = useUpdateVariant();

  useEffect(() => {
    if (open && variant) {
      // Cargar valores básicos
      const formValues: Record<string, unknown> = {
        sku: variant.sku,
        price: variant.price,
      };

      // Cargar valores de atributos desde el objeto attributes
      if (variant.attributes && productAttributes) {
        productAttributes.forEach((attr) => {
          const value = variant.attributes[attr.attributeName];
          if (value !== undefined) {
            formValues[`attr_${attr.attributeName}`] = String(value);
          }
        });
      }

      form.setFieldsValue(formValues);
    } else if (open && !variant) {
      form.resetFields();
    }
  }, [open, variant, form, productAttributes]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Construir objeto de atributos desde los campos dinámicos
      const attributes: Record<string, string> = {};
      if (productAttributes) {
        productAttributes.forEach((attr) => {
          const value = values[`attr_${attr.attributeName}`];
          if (value) {
            attributes[attr.attributeName] = value;
          }
        });
      }

      const payload = {
        sku: values.sku,
        price: values.price,
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

  const hasAttributes = productAttributes && productAttributes.length > 0;

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
            { type: 'number', min: 0.01, message: 'Precio debe ser mayor a 0' },
          ]}
        >
          <InputNumber
            placeholder="99.99"
            style={{ width: '100%' }}
            precision={2}
            min={0.01}
            addonBefore="S/"
          />
        </Form.Item>

        {/* Sección de Atributos */}
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Atributos de la Variante
          </Text>

          {isLoadingAttributes ? (
            <Text type="secondary">Cargando atributos...</Text>
          ) : !hasAttributes ? (
            <Alert
              type="info"
              showIcon
              message="Sin atributos definidos"
              description={
                <span>
                  Para agregar atributos a las variantes, primero define los atributos disponibles
                  en la pestaña <strong>Atributos de Variantes</strong> del producto.
                </span>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {productAttributes.map((attr) => (
                <Form.Item
                  key={attr.id}
                  label={attr.attributeDisplayName}
                  name={`attr_${attr.attributeName}`}
                  rules={[{ required: true, message: `${attr.attributeDisplayName} es requerido` }]}
                >
                  <Select
                    placeholder={`Seleccionar ${attr.attributeDisplayName.toLowerCase()}`}
                    options={attr.effectiveOptions.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              ))}
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};
