import { Modal, Form, Input, InputNumber, DatePicker, Select, Switch, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useShippingMethods } from '@features/backoffice/logistic/hooks/useShippingMethods';
import { useOrderMutations } from '../hooks/useOrderMutations';
import { getPaidOrders, getOrderById } from '../api/ordersApi';
import { customersApi } from '@features/backoffice/customer/api/customersApi';
import type { CreateShipmentForOrderRequest, OrderResponse, ShippingMethodResponse } from '@types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface CreateShipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback opcional cuando se crea el envío exitosamente
}

const SHIPMENT_TYPE_OPTIONS = [
  { label: 'Envío Saliente (Pedido)', value: 'OUTBOUND' },
  { label: 'Envío Entrante (Devolución/RMA)', value: 'INBOUND' },
];

export const CreateShipmentModal = ({ open, onClose, onSuccess }: CreateShipmentModalProps) => {
  const [form] = Form.useForm();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const queryClient = useQueryClient();
  const { createShipment, isCreatingShipment } = useOrderMutations();
  const { data: shippingMethodsData } = useShippingMethods(0, 100, undefined, true); // Solo métodos activos

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
      
      // Auto-completar dirección y datos del destinatario
      form.setFieldsValue({
        recipientName: orderDetail.customerName,
        recipientPhone: phoneNumber,
      });
    }
  }, [orderDetail, customerData, form]);

  // Auto-completar costo y fecha estimada cuando se selecciona método de envío
  const handleShippingMethodChange = (shippingMethodId: number) => {
    const method = shippingMethodsData?.content.find((m) => m.id === shippingMethodId);
    if (!method) return;

    // Calcular peso estimado (simplificado, en producción se calcularía mejor)
    const weightKg = form.getFieldValue('weightKg') || 1;
    const estimatedCost = method.baseCost + method.costPerKg * weightKg;

    // Calcular fecha estimada (usando promedio de días)
    const avgDays = Math.ceil((method.estimatedDaysMin + method.estimatedDaysMax) / 2);
    const estimatedDate = dayjs().add(avgDays, 'day');

    form.setFieldsValue({
      shippingCost: estimatedCost,
      estimatedDeliveryDate: estimatedDate,
    });
  };

  const handleSubmit = async (values: {
    orderId: number;
    shipmentType: string;
    shippingMethodId: number;
    trackingNumber: string;
    shippingCost: number;
    weightKg: number;
    estimatedDeliveryDate: dayjs.Dayjs;
    recipientName?: string;
    recipientPhone?: string;
    requireSignature?: boolean;
    packageQuantity?: number;
    notes?: string;
  }) => {
    try {
      const request: CreateShipmentForOrderRequest = {
        shipmentType: values.shipmentType,
        shippingMethodId: values.shippingMethodId,
        trackingNumber: values.trackingNumber,
        shippingCost: values.shippingCost,
        weightKg: values.weightKg,
        estimatedDeliveryDate: values.estimatedDeliveryDate.toISOString(),
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        requireSignature: values.requireSignature || false,
        packageQuantity: values.packageQuantity || 1,
        notes: values.notes,
      };

      await createShipment({ orderId: values.orderId, request });
      
      // CRÍTICO: Invalidar queries para refrescar automáticamente (igual que en pagos)
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] }); // Invalida TODAS las queries de order
      queryClient.invalidateQueries({ queryKey: ['paid-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      
      message.success('Envío creado exitosamente');
      
      form.resetFields();
      setSelectedOrderId(null);
      setSelectedOrder(null);
      
      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch {
      // Error handled in mutation
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedOrderId(null);
    setSelectedOrder(null);
    onClose();
  };

  return (
    <Modal
      title="Crear Envío"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={isCreatingShipment}
      width={700}
      okText="Crear Envío"
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          shipmentType: 'OUTBOUND',
          requireSignature: false,
          packageQuantity: 1,
        }}
      >
        <Form.Item
          name="orderId"
          label="Pedido Pagado"
          rules={[{ required: true, message: 'Seleccione el pedido a enviar' }]}
        >
          <Select
            placeholder="Seleccione pedido pagado"
            showSearch
            optionFilterProp="label"
            onChange={(value) => setSelectedOrderId(value)}
            loading={!paidOrdersData}
            options={paidOrdersData?.content.map((order) => ({
              label: `${order.orderNumber} - ${order.customerName} - S/ ${order.total.toFixed(2)}`,
              value: order.id,
            }))}
          />
        </Form.Item>

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

        <Form.Item
          name="shipmentType"
          label="Tipo de Envío"
          rules={[{ required: true, message: 'Seleccione el tipo de envío' }]}
        >
          <Select placeholder="Seleccione tipo de envío" options={SHIPMENT_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="shippingMethodId"
          label="Método de Envío"
          rules={[{ required: true, message: 'Seleccione el método de envío' }]}
        >
          <Select
            placeholder="Seleccione método de envío"
            onChange={handleShippingMethodChange}
            options={shippingMethodsData?.content.map((method) => ({
              label: `${method.name} - ${method.carrier} (${method.estimatedDaysMin}-${method.estimatedDaysMax} días)`,
              value: method.id,
            }))}
            loading={!shippingMethodsData}
          />
        </Form.Item>

        <Form.Item
          name="trackingNumber"
          label="Número de Tracking"
          rules={[{ required: true, message: 'Ingrese el número de tracking' }]}
        >
          <Input placeholder="Ej: TRACK123456789" />
        </Form.Item>

        <Form.Item
          name="weightKg"
          label="Peso (kg)"
          rules={[
            { required: true, message: 'Ingrese el peso' },
            { type: 'number', min: 0.01, message: 'El peso debe ser mayor a 0' },
          ]}
        >
          <InputNumber
            placeholder="Ej: 2.5"
            style={{ width: '100%' }}
            min={0.01}
            step={0.1}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="shippingCost"
          label="Costo de Envío (S/)"
          rules={[
            { required: true, message: 'Ingrese el costo de envío' },
            { type: 'number', min: 0, message: 'El costo debe ser mayor o igual a 0' },
          ]}
        >
          <InputNumber
            placeholder="Ej: 15.50"
            style={{ width: '100%' }}
            min={0}
            step={0.1}
            precision={2}
            addonBefore="S/"
          />
        </Form.Item>

        <Form.Item
          name="estimatedDeliveryDate"
          label="Fecha Estimada de Entrega"
          rules={[{ required: true, message: 'Seleccione la fecha estimada de entrega' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Seleccione fecha"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        <Form.Item name="recipientName" label="Nombre del Destinatario (Opcional)">
          <Input placeholder="Dejar vacío para usar del pedido" />
        </Form.Item>

        <Form.Item
          name="recipientPhone"
          label="Teléfono del Destinatario (Opcional)"
          rules={[
            {
              pattern: /^9\d{8}$/,
              message: 'Debe ser 9 dígitos e iniciar con 9',
            },
          ]}
        >
          <Input placeholder="987654321" addonBefore="+51" maxLength={9} />
        </Form.Item>

        <Form.Item
          name="packageQuantity"
          label="Cantidad de Paquetes"
          rules={[
            { required: true, message: 'Ingrese la cantidad de paquetes' },
            { type: 'number', min: 1, message: 'Debe ser al menos 1' },
          ]}
        >
          <InputNumber placeholder="Ej: 1" style={{ width: '100%' }} min={1} />
        </Form.Item>

        <Form.Item name="requireSignature" label="Requiere Firma" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="notes" label="Notas">
          <Input.TextArea
            placeholder="Notas adicionales sobre el envío..."
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
