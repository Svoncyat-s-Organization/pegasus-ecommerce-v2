import { DatePicker, Form, Input, InputNumber, Modal, Select, Tag, Typography, message } from 'antd';
import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { CreateShipmentRequest, RmaResponse } from '@types';
import { useShippingMethods } from '@features/backoffice/logistic/hooks/useShippingMethods';
import { createShipment } from '@features/backoffice/logistic/api/shipmentsApi';
import { useBusinessInfo } from '@features/backoffice/settings/hooks/useSettings';

const { Text } = Typography;

type FormValues = {
  shippingMethodId: number;
  trackingNumber: string;
  weightKg: number;
  shippingCost: number;
  estimatedDeliveryDate: dayjs.Dayjs;
  notes?: string;
};

interface CreateReturnShipmentModalProps {
  open: boolean;
  rma: RmaResponse;
  onClose: () => void;
  onMarkInTransit: (comments?: string) => Promise<unknown>;
  isMarkingInTransit: boolean;
}

const cleanPeruPhone = (phone: string): string => {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+51')) return trimmed.substring(3).trim();
  return trimmed;
};

export const CreateReturnShipmentModal = ({
  open,
  rma,
  onClose,
  onMarkInTransit,
  isMarkingInTransit,
}: CreateReturnShipmentModalProps) => {
  const [form] = Form.useForm<FormValues>();
  const queryClient = useQueryClient();

  const { data: businessInfo } = useBusinessInfo();
  const { data: shippingMethodsData } = useShippingMethods(0, 100, undefined, true);

  const createShipmentMutation = useMutation({
    mutationFn: (request: CreateShipmentRequest) => createShipment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipments-order'] });
    },
  });

  const confirmLoading = createShipmentMutation.isPending || isMarkingInTransit;

  const shippingMethodOptions = useMemo(
    () =>
      shippingMethodsData?.content.map((method) => ({
        label: `${method.name} - ${method.carrier} (${method.estimatedDaysMin}-${method.estimatedDaysMax} días)`,
        value: method.id,
      })) ?? [],
    [shippingMethodsData]
  );

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

  const handleSubmit = async (values: FormValues) => {
    if (!businessInfo) {
      message.error('Configure primero la información de la empresa (Settings)');
      return;
    }

    const recipientPhone = cleanPeruPhone(businessInfo.phone);

    const request: CreateShipmentRequest = {
      shipmentType: 'INBOUND',
      orderId: rma.orderId,
      rmaId: rma.id,
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
      notes: `Devolución (RMA ${rma.rmaNumber})${values.notes ? ` - ${values.notes}` : ''}`,
    };

    try {
      await createShipmentMutation.mutateAsync(request);
      await onMarkInTransit(`Tracking: ${values.trackingNumber}`);

      message.success('Envío de devolución creado y RMA marcado en tránsito');

      form.resetFields();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear el envío de devolución');
    }
  };

  return (
    <Modal
      title="Crear envío de devolución (hacia tienda)"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      okText="Crear envío"
      cancelText="Cancelar"
      width={750}
    >
      <div style={{ marginBottom: 12 }}>
        <Tag color="blue">Tipo: Entrante (Devolución)</Tag>
      </div>

      <div style={{ marginBottom: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
        <Text strong>RMA:</Text> <Text>{rma.rmaNumber}</Text>
        <br />
        <Text strong>Pedido:</Text> <Text>{rma.orderNumber}</Text>
        <br />
        <Text strong>Cliente:</Text> <Text>{rma.customerName}</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          weightKg: 1,
          shippingCost: 0,
          estimatedDeliveryDate: dayjs().add(5, 'day'),
        }}
      >
        <Form.Item
          name="shippingMethodId"
          label="Método de Envío"
          rules={[{ required: true, message: 'Seleccione el método de envío' }]}
        >
          <Select
            placeholder="Seleccione método de envío"
            onChange={handleShippingMethodChange}
            options={shippingMethodOptions}
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
            placeholder="Ej: 15.00"
            style={{ width: '100%' }}
            min={0}
            step={0.5}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="estimatedDeliveryDate"
          label="Fecha estimada de entrega"
          rules={[{ required: true, message: 'Seleccione la fecha estimada' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item name="notes" label="Notas">
          <Input.TextArea rows={3} placeholder="Notas opcionales..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
