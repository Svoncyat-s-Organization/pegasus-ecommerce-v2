import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Select, DatePicker, Checkbox } from 'antd';
import { useShippingMethods } from '../hooks/useShippingMethods';
import { SHIPMENT_TYPES } from '../constants';
import dayjs from 'dayjs';
import type { Shipment, CreateShipmentRequest } from '@types';

const { Option } = Select;

interface ShipmentFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateShipmentRequest) => void;
  initialValues?: Shipment;
  isLoading?: boolean;
}

export const ShipmentFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  isLoading,
}: ShipmentFormModalProps) => {
  const [form] = Form.useForm();
  const { data: shippingMethodsData } = useShippingMethods(0, 100, undefined, true);

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        estimatedDeliveryDate: dayjs(initialValues.estimatedDeliveryDate),
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        estimatedDeliveryDate: values.estimatedDeliveryDate.toISOString(),
        shippingAddress: values.shippingAddress || {},
      };
      onSubmit(submitData);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Editar Envío' : 'Crear Envío'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={isLoading}
      okText={initialValues ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
      width={800}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tipo de Envío"
              name="shipmentType"
              rules={[{ required: true, message: 'El tipo de envío es requerido' }]}
            >
              <Select placeholder="Seleccione el tipo">
                {Object.entries(SHIPMENT_TYPES).map(([key, label]) => (
                  <Option key={key} value={key}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="ID de Orden"
              name="orderId"
              rules={[{ required: true, message: 'El ID de orden es requerido' }]}
            >
              <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="ID de RMA (opcional)" name="rmaId">
              <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Método de Envío"
              name="shippingMethodId"
              rules={[{ required: true, message: 'El método de envío es requerido' }]}
            >
              <Select placeholder="Seleccione un método" showSearch optionFilterProp="label">
                {shippingMethodsData?.content.map((method) => (
                  <Option key={method.id} value={method.id} label={method.name}>
                    {method.name} - {method.carrier}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Número de Tracking"
              name="trackingNumber"
              rules={[{ required: true, message: 'El número de tracking es requerido' }]}
            >
              <Input placeholder="TRK-123456789" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Peso (kg)"
              name="weightKg"
              rules={[{ required: true, message: 'El peso es requerido' }]}
            >
              <InputNumber
                min={0.01}
                precision={2}
                placeholder="1.50"
                style={{ width: '100%' }}
                addonAfter="kg"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Costo de Envío"
              name="shippingCost"
              rules={[{ required: true, message: 'El costo de envío es requerido' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                placeholder="15.00"
                style={{ width: '100%' }}
                addonBefore="S/"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Cantidad de Paquetes"
              name="packageQuantity"
              initialValue={1}
            >
              <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Fecha Estimada de Entrega"
              name="estimatedDeliveryDate"
              rules={[{ required: true, message: 'La fecha estimada es requerida' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Seleccione fecha"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Teléfono del Destinatario" name="recipientPhone">
              <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nombre del Destinatario"
              name="recipientName"
              rules={[{ required: true, message: 'El nombre del destinatario es requerido' }]}
            >
              <Input placeholder="Juan Pérez" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="requireSignature" valuePropName="checked" initialValue={false}>
              <Checkbox>Requiere firma del destinatario</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Notas (opcional)" name="notes">
          <Input.TextArea rows={3} placeholder="Notas adicionales sobre el envío..." />
        </Form.Item>

        <Form.Item
          label="Dirección de Envío (JSON)"
          name="shippingAddress"
          tooltip="Ingrese la dirección en formato JSON"
          rules={[
            { required: true, message: 'La dirección de envío es requerida' },
            {
              validator: (_, value) => {
                try {
                  if (value) JSON.parse(value);
                  return Promise.resolve();
                } catch {
                  return Promise.reject(new Error('JSON inválido'));
                }
              },
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder='{"street": "Av. Principal 123", "district": "Lima", "ubigeo": "150101"}'
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
