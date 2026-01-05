import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col } from 'antd';
import type { ShippingMethod, CreateShippingMethodRequest, UpdateShippingMethodRequest } from '@types';

interface ShippingMethodFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateShippingMethodRequest | UpdateShippingMethodRequest) => void;
  initialValues?: ShippingMethod;
  isLoading?: boolean;
}

export const ShippingMethodFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  isLoading,
}: ShippingMethodFormModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Editar Método de Envío' : 'Crear Método de Envío'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={isLoading}
      okText={initialValues ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
      width={700}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre"
              name="name"
              rules={[{ required: true, message: 'El nombre es requerido' }]}
            >
              <Input placeholder="Ej: Envío Express" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Transportista"
              name="carrier"
              rules={[{ required: true, message: 'El transportista es requerido' }]}
            >
              <Input placeholder="Ej: Olva Courier" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Descripción"
          name="description"
          rules={[{ required: true, message: 'La descripción es requerida' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Describe las características del método de envío"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Días Mínimos Estimados"
              name="estimatedDaysMin"
              rules={[
                { required: true, message: 'Los días mínimos son requeridos' },
                { type: 'number', min: 1, message: 'Debe ser mayor a 0' },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="1"
                style={{ width: '100%' }}
                addonAfter="días"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Días Máximos Estimados"
              name="estimatedDaysMax"
              rules={[
                { required: true, message: 'Los días máximos son requeridos' },
                { type: 'number', min: 1, message: 'Debe ser mayor a 0' },
              ]}
            >
              <InputNumber
                min={1}
                placeholder="5"
                style={{ width: '100%' }}
                addonAfter="días"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Costo Base"
              name="baseCost"
              rules={[
                { required: true, message: 'El costo base es requerido' },
                { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                placeholder="10.00"
                style={{ width: '100%' }}
                addonBefore="S/"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Costo por Kg"
              name="costPerKg"
              rules={[
                { required: true, message: 'El costo por kg es requerido' },
                { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                placeholder="2.50"
                style={{ width: '100%' }}
                addonBefore="S/"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
