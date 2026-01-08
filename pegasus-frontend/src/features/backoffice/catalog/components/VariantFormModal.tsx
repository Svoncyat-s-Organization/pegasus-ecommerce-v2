import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Select, Typography, Alert, Row, Col, message } from 'antd';
import { IconDeviceFloppy } from '@tabler/icons-react';
import type { VariantResponse, CreateVariantRequest, UpdateVariantRequest } from '@types';
import { useCreateVariant, useUpdateVariant } from '../hooks/useVariants';
import { useProductVariantAttributes } from '../hooks/useProductVariantAttributes';
import type { LocalVariantAttribute } from './product-form/ProductVariantAttributesEditor';

const { Text } = Typography;

interface LocalVariant {
  sku: string;
  price: number;
  attributes: Record<string, unknown>;
  tempId?: string;
}

interface VariantFormModalProps {
  open: boolean;
  onCancel: () => void;
  productId?: number;
  variant?: VariantResponse | LocalVariant;
  localMode?: boolean;
  localVariantAttributes?: LocalVariantAttribute[];
  onLocalSave?: (variant: LocalVariant) => void;
}

export const VariantFormModal = ({ 
  open, 
  onCancel, 
  productId, 
  variant,
  localMode = false,
  localVariantAttributes = [],
  onLocalSave,
}: VariantFormModalProps) => {
  const [form] = Form.useForm();
  const isEdit = !!variant;

  const { data: serverAttributes, isLoading: isLoadingAttributes } = useProductVariantAttributes(
    productId || 0,
    { enabled: !localMode && !!productId }
  );
  const createMutation = useCreateVariant();
  const updateMutation = useUpdateVariant();

  const productAttributes = localMode ? localVariantAttributes : serverAttributes;

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
          let attrName: string | undefined;
          if ('attributeName' in attr && attr.attributeName) {
            attrName = attr.attributeName as string;
          } else if ('name' in attr && typeof attr.name === 'string') {
            attrName = attr.name;
          }
          
          if (attrName) {
            const value = variant.attributes[attrName];
            if (value !== undefined) {
              formValues[`attr_${attrName}`] = String(value);
            }
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
        productAttributes.forEach((attr: unknown) => {
          const typedAttr = attr as { attributeName?: string; name?: string };
          const attrName = typedAttr.attributeName || typedAttr.name || '';
          if (!attrName) return;
          const value = values[`attr_${attrName}`];
          if (value) {
            attributes[attrName] = value;
          }
        });
      }

      const payload = {
        sku: values.sku,
        price: values.price,
        attributes,
      };

      // Local mode: notify parent
      if (localMode && onLocalSave) {
        const tempId = variant && 'tempId' in variant ? variant.tempId : undefined;
        const localVariant: LocalVariant = {
          ...payload,
          tempId,
        };
        onLocalSave(localVariant);
        message.success(isEdit ? 'Variante actualizada' : 'Variante agregada');
        form.resetFields();
        onCancel();
        return;
      }

      // Server mode: save to database
      if (!productId) return;

      if (isEdit && variant && 'id' in variant) {
        await updateMutation.mutateAsync({ 
          id: variant.id, 
          request: payload as UpdateVariantRequest 
        });
      } else {
        await createMutation.mutateAsync({ 
          ...payload, 
          productId 
        } as CreateVariantRequest);
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
          loading={!localMode && (createMutation.isPending || updateMutation.isPending)}
          icon={<IconDeviceFloppy size={16} />}
        >
          {isEdit ? 'Guardar Cambios' : 'Crear Variante'}
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical">
        {/* Información Básica */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 16 }}>
            Información Básica
          </Text>

          <Row gutter={16}>
            <Col span={14}>
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
            </Col>
            <Col span={10}>
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
            </Col>
          </Row>
        </div>

        {/* Atributos de la Variante */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 16 }}>
            Atributos de la Variante
          </Text>

          {isLoadingAttributes ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <Text type="secondary">Cargando atributos...</Text>
            </div>
          ) : !hasAttributes ? (
            <Alert
              type="info"
              showIcon
              message="Sin atributos definidos"
              description={
                <span>
                  Para agregar atributos a las variantes, primero define los atributos disponibles
                  en la sección <strong>Atributos de Variantes</strong>.
                </span>
              }
            />
          ) : (
            <Row gutter={16}>
              {productAttributes.map((attr: unknown, idx: number) => {
                const typedAttr = attr as LocalVariantAttribute | { 
                  id: number;
                  attributeName: string; 
                  attributeDisplayName: string;
                  effectiveOptions: string[];
                };
                
                const attrName = 'attributeName' in typedAttr ? typedAttr.attributeName : '';
                const displayName = 'attributeDisplayName' in typedAttr ? typedAttr.attributeDisplayName : attrName;
                const options = 'effectiveOptions' in typedAttr ? typedAttr.effectiveOptions : 
                  'customOptions' in typedAttr && typedAttr.customOptions ? typedAttr.customOptions : [];
                
                return (
                  <Col span={12} key={idx}>
                    <Form.Item
                      label={displayName}
                      name={`attr_${attrName}`}
                      rules={[{ required: true, message: `${displayName} es requerido` }]}
                    >
                      <Select
                        placeholder={`Seleccionar ${displayName?.toLowerCase() || ''}`}
                        options={options.map((option: string) => ({
                          label: option,
                          value: option,
                        }))}
                        showSearch
                        optionFilterProp="label"
                      />
                    </Form.Item>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </Form>
    </Modal>
  );
};
