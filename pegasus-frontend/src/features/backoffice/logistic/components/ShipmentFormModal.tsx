import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Select, DatePicker, Checkbox, Typography, Tag, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useShippingMethods } from '../hooks/useShippingMethods';
import { getPaidOrdersWithInvoice, getOrderById } from '@features/backoffice/order/api/ordersApi';
import { customersApi } from '@features/backoffice/customer/api/customersApi';
import { getRmas } from '@features/backoffice/rma/api/rmasApi';
import { useBusinessInfo } from '@features/backoffice/settings/hooks/useSettings';
import { SHIPMENT_TYPES } from '../constants';
import dayjs from 'dayjs';
import type { Shipment, CreateShipmentRequest, OrderResponse, RmaSummaryResponse } from '@types';

const { Option } = Select;
const { Text } = Typography;

interface ShipmentFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateShipmentRequest) => void;
  initialValues?: Shipment;
  isLoading?: boolean;
  initialOrder?: {
    id: number;
    orderNumber: string;
    customerName: string;
    total: number;
  };
  lockOrder?: boolean;
}

export const ShipmentFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  isLoading,
  initialOrder,
  lockOrder,
}: ShipmentFormModalProps) => {
  const [form] = Form.useForm();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [selectedRmaId, setSelectedRmaId] = useState<number | null>(null);
  const [selectedRma, setSelectedRma] = useState<RmaSummaryResponse | null>(null);
  const { data: shippingMethodsData } = useShippingMethods(0, 100, undefined, true);
  const { data: businessInfo } = useBusinessInfo();

  const shipmentType = Form.useWatch('shipmentType', form) as string | undefined;
  const isOrderLocked = !!initialOrder && lockOrder !== false;

  // Cargar pedidos pagados - se refresca cada vez que se abre el modal
  const { data: paidOrdersData } = useQuery({
    queryKey: ['paid-orders-with-invoice'],
    queryFn: () => getPaidOrdersWithInvoice(),
    enabled: open && shipmentType === 'OUTBOUND',
    refetchOnMount: true,
  });

  const { data: approvedRmasData } = useQuery({
    queryKey: ['approved-rmas'],
    queryFn: () => getRmas(0, 100, undefined, 'APPROVED'),
    enabled: open && shipmentType === 'INBOUND',
    refetchOnMount: true,
  });

  // Cargar detalles del pedido seleccionado
  const { data: orderDetail } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => getOrderById(selectedOrderId!),
    enabled: !!selectedOrderId && shipmentType === 'OUTBOUND',
  });

  // Cargar datos del cliente cuando se selecciona un pedido
  const { data: customerData } = useQuery({
    queryKey: ['customer', orderDetail?.customerId],
    queryFn: () => customersApi.getCustomerById(orderDetail!.customerId),
    enabled: !!orderDetail?.customerId && shipmentType === 'OUTBOUND',
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
    if (!approvedRmasData?.content || !selectedRmaId) return;
    const found = approvedRmasData.content.find((rma) => rma.id === selectedRmaId) ?? null;
    setSelectedRma(found);
  }, [approvedRmasData, selectedRmaId]);

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
      setSelectedRmaId(null);
      setSelectedRma(null);
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (!open) return;
    if (initialValues) return;
    if (!initialOrder) return;

    form.setFieldsValue({ shipmentType: 'OUTBOUND', orderId: initialOrder.id });
    setSelectedOrderId(initialOrder.id);
  }, [open, initialValues, initialOrder, form]);

  useEffect(() => {
    if (!open) return;

    if (shipmentType === 'OUTBOUND') {
      setSelectedRmaId(null);
      setSelectedRma(null);
      form.setFieldsValue({ rmaId: undefined });
    }

    if (shipmentType === 'INBOUND') {
      setSelectedOrderId(null);
      setSelectedOrder(null);
      form.setFieldsValue({
        orderId: undefined,
        recipientName: undefined,
        recipientPhone: undefined,
        requireSignature: false,
        packageQuantity: 1,
      });
    }
  }, [open, shipmentType, form]);

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

      if (values.shipmentType === 'OUTBOUND') {
        const shippingAddress = orderDetail?.shippingAddress || {};
        const submitData: CreateShipmentRequest = {
          ...values,
          estimatedDeliveryDate: values.estimatedDeliveryDate.toISOString(),
          shippingAddress,
        };
        onSubmit(submitData);
        form.resetFields();
        return;
      }

      if (!selectedRma) {
        message.error('Seleccione una devolución aprobada');
        return;
      }
      if (!businessInfo) {
        message.error('Configure primero la información de la empresa (Settings)');
        return;
      }

      const trimmedPhone = businessInfo.phone.trim();
      const recipientPhone = trimmedPhone.startsWith('+51') ? trimmedPhone.substring(3).trim() : trimmedPhone;

      const submitData: CreateShipmentRequest = {
        shipmentType: 'INBOUND',
        orderId: selectedRma.orderId,
        rmaId: selectedRma.id,
        shippingMethodId: values.shippingMethodId,
        trackingNumber: values.trackingNumber,
        shippingCost: values.shippingCost,
        weightKg: values.weightKg,
        estimatedDeliveryDate: values.estimatedDeliveryDate.toISOString(),
        shippingAddress: {
          ubigeoId: businessInfo.ubigeoId,
          address: businessInfo.legalAddress,
          recipientName: businessInfo.businessName,
          recipientPhone,
        },
        recipientName: businessInfo.businessName,
        recipientPhone,
        requireSignature: false,
        packageQuantity: 1,
        notes: `Devolución (RMA ${selectedRma.rmaNumber})${values.notes ? ` - ${values.notes}` : ''}`,
      };

      onSubmit(submitData);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const shippingMethodOptions = useMemo(
    () =>
      shippingMethodsData?.content.map((method) => ({
        label: `${method.name} - ${method.carrier} (${method.estimatedDaysMin}-${method.estimatedDaysMax} días)`,
        value: method.id,
      })) ?? [],
    [shippingMethodsData]
  );

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
              label="Tipo de Envío"
              name="shipmentType"
              rules={[{ required: true, message: 'El tipo de envío es requerido' }]}
              initialValue="OUTBOUND"
            >
              <Select
                placeholder="Seleccione el tipo"
                disabled={!!initialValues}
              >
                {Object.entries(SHIPMENT_TYPES).map(([key, label]) => (
                  <Option key={key} value={key}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {shipmentType === 'OUTBOUND' && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Pedido pagado con comprobante"
                name="orderId"
                rules={[{ required: true, message: 'Seleccione el pedido a enviar' }]}
              >
                <Select
                  placeholder="Seleccione pedido"
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => setSelectedOrderId(value)}
                  loading={!paidOrdersData}
                  disabled={!!initialValues || isOrderLocked}
                >
                  {initialOrder &&
                    !(paidOrdersData?.content || []).some((o) => o.id === initialOrder.id) && (
                      <Option
                        key={initialOrder.id}
                        value={initialOrder.id}
                        label={`${initialOrder.orderNumber} - ${initialOrder.customerName}`}
                      >
                        {initialOrder.orderNumber} - {initialOrder.customerName} - S/ {initialOrder.total.toFixed(2)}
                      </Option>
                    )}
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
        )}

        {shipmentType === 'INBOUND' && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Devolución aprobada"
                name="rmaId"
                rules={[{ required: true, message: 'Seleccione la devolución' }]}
              >
                <Select
                  placeholder="Seleccione devolución (RMA)"
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => setSelectedRmaId(value)}
                  loading={!approvedRmasData}
                  disabled={!!initialValues}
                >
                  {approvedRmasData?.content.map((rma) => (
                    <Option
                      key={rma.id}
                      value={rma.id}
                      label={`${rma.rmaNumber} - ${rma.customerName}`}
                    >
                      {rma.rmaNumber} - {rma.customerName} - {rma.orderNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

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

        {shipmentType === 'INBOUND' && selectedRma && (
          <div style={{ marginBottom: 16 }}>
            <Tag color="blue">Tipo: Entrante (Devolución)</Tag>
            <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Text strong>RMA: </Text>
              <Text>{selectedRma.rmaNumber}</Text>
              <br />
              <Text strong>Pedido: </Text>
              <Text>{selectedRma.orderNumber}</Text>
              <br />
              <Text strong>Cliente: </Text>
              <Text>{selectedRma.customerName}</Text>
            </div>
          </div>
        )}

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
                options={shippingMethodOptions}
              >
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
          {shipmentType === 'OUTBOUND' && (
            <Col span={8}>
              <Form.Item
                label="Cantidad de Paquetes"
                name="packageQuantity"
                initialValue={1}
              >
                <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          )}
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

          {shipmentType === 'OUTBOUND' && (
            <Col span={12}>
              <Form.Item label="Teléfono del Destinatario" name="recipientPhone">
                <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
              </Form.Item>
            </Col>
          )}
        </Row>

        {shipmentType === 'OUTBOUND' && (
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
        )}

        <Form.Item label="Notas (opcional)" name="notes">
          <Input.TextArea rows={3} placeholder="Notas adicionales sobre el envío..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
