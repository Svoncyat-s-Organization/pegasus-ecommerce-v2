import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Select, DatePicker, Checkbox, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useShippingMethods } from '../hooks/useShippingMethods';
import { getPaidOrders, getOrderById } from '@features/backoffice/order/api/ordersApi';
import { customersApi } from '@features/backoffice/customer/api/customersApi';
import { SHIPMENT_TYPES } from '../constants';
import dayjs from 'dayjs';
import type { Shipment, CreateShipmentRequest, OrderResponse } from '@types';

const { Option } = Select;
const { Text } = Typography;

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
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const { data: shippingMethodsData } = useShippingMethods(0, 100, undefined, true);

  // Cargar pedidos pagados - se refresca cada vez que se abre el modal
  const { data: paidOrdersData } = useQuery({
    queryKey: ['paid-orders'],
    queryFn: () => getPaidOrders(),
    enabled: open, // Solo cargar cuando el modal está abierto
    refetchOnMount: true, // Siempre refrescar al montar
  });

  // Cargar detalles del pedido seleccionado
  const { data: orderDetail } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => getOrderById(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  // Cargar datos del cliente cuando se selecciona un pedido
  const { data: customerData } = useQuery({
    queryKey: ['customer', orderDetail?.customerId],
    queryFn: () => customersApi.getCustomerById(orderDetail!.customerId),
    enabled: !!orderDetail?.customerId,
  });

  // Auto-completar datos del pedido cuando se carga el detalle
  useEffect(() => {
    if (orderDetail && customerData) {
      setSelectedOrder(orderDetail);
      
      // Limpiar el teléfono (quitar +51 si viene)
      let phoneNumber = customerData.phone || '';
      if (phoneNumber.startsWith('+51')) {
        phoneNumber = phoneNumber.substring(3).trim();
      }
      
      form.setFieldsValue({
        recipientName: orderDetail.customerName,
        recipientPhone: phoneNumber,
      });
    }
  }, [orderDetail, customerData, form]);

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        estimatedDeliveryDate: dayjs(initialValues.estimatedDeliveryDate),
      });
    } else if (open) {
      form.resetFields();
      setSelectedOrderId(null);
      setSelectedOrder(null);
    }
  }, [open, initialValues, form]);

  // Auto-completar costo y fecha estimada cuando se selecciona método de envío
  const handleShippingMethodChange = (shippingMethodId: number) => {
    const method = shippingMethodsData?.content.find((m) => m.id === shippingMethodId);
    if (!method) return;

    const weightKg = form.getFieldValue('weightKg') || 1;
    const estimatedCost = method.baseCost + method.costPerKg * weightKg;
    const avgDays = Math.ceil((method.estimatedDaysMin + method.estimatedDaysMax) / 2);
    const estimatedDate = dayjs().add(avgDays, 'day');

    form.setFieldsValue({
      shippingCost: estimatedCost,
      estimatedDeliveryDate: estimatedDate,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Obtener la dirección del pedido seleccionado
      const shippingAddress = orderDetail?.shippingAddress || {};
      
      const submitData = {
        ...values,
        estimatedDeliveryDate: values.estimatedDeliveryDate.toISOString(),
        shippingAddress,
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
          <Col span={24}>
            <Form.Item
              label="Pedido Pagado"
              name="orderId"
              rules={[{ required: true, message: 'Seleccione el pedido a enviar' }]}
            >
              <Select
                placeholder="Seleccione pedido pagado"
                showSearch
                optionFilterProp="label"
                onChange={(value) => setSelectedOrderId(value)}
                loading={!paidOrdersData}
                disabled={!!initialValues}
              >
                {paidOrdersData?.content.map((order) => (
                  <Option
                    key={order.id}
                    value={order.id}
                    label={`${order.orderNumber} - ${order.customerName}`}
                  >
                    {order.orderNumber} - {order.customerName} - S/ {order.total.toFixed(2)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {selectedOrder && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <Text strong>Cliente: </Text>
            <Text>{selectedOrder.customerName}</Text>
            <br />
            <Text strong>Email: </Text>
            <Text>{selectedOrder.customerEmail}</Text>
            <br />
            <Text strong>Total: </Text>
            <Text>S/ {selectedOrder.total.toFixed(2)}</Text>
          </div>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tipo de Envío"
              name="shipmentType"
              rules={[{ required: true, message: 'El tipo de envío es requerido' }]}
              initialValue="OUTBOUND"
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Método de Envío"
              name="shippingMethodId"
              rules={[{ required: true, message: 'El método de envío es requerido' }]}
            >
              <Select
                placeholder="Seleccione un método"
                showSearch
                optionFilterProp="label"
                onChange={handleShippingMethodChange}
              >
                {shippingMethodsData?.content.map((method) => (
                  <Option key={method.id} value={method.id} label={method.name}>
                    {method.name} - {method.carrier} ({method.estimatedDaysMin}-
                    {method.estimatedDaysMax} días)
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
      </Form>
    </Modal>
  );
};
