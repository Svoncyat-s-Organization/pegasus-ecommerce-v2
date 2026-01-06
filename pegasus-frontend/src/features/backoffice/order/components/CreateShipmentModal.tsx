import { Modal, Form, Input, InputNumber, DatePicker, Select, Switch } from 'antd';
import { useShippingMethods } from '@features/backoffice/logistic/hooks/useShippingMethods';
import { useOrderMutations } from '../hooks/useOrderMutations';
import type { CreateShipmentForOrderRequest } from '@types';
import dayjs from 'dayjs';

interface CreateShipmentModalProps {
  orderId: number | null;
  open: boolean;
  onClose: () => void;
}

const SHIPMENT_TYPE_OPTIONS = [
  { label: 'Orden', value: 'ORDER' },
  { label: 'RMA (Retorno)', value: 'RMA' },
];

export const CreateShipmentModal = ({ orderId, open, onClose }: CreateShipmentModalProps) => {
  const [form] = Form.useForm();
  const { createShipment, isCreatingShipment } = useOrderMutations();
  const { data: shippingMethodsData } = useShippingMethods(0, 100); // Get all active methods

  const handleSubmit = async (values: {
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
    if (!orderId) return;

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

      await createShipment({ orderId, request });
      form.resetFields();
      onClose();
    } catch {
      // Error handled in mutation
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Crear Envío para Pedido"
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={isCreatingShipment}
      width={600}
      okText="Crear Envío"
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          shipmentType: 'ORDER',
          requireSignature: false,
          packageQuantity: 1,
        }}
      >
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
            options={shippingMethodsData?.content.map((method) => ({
              label: `${method.name} - ${method.carrier}`,
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
