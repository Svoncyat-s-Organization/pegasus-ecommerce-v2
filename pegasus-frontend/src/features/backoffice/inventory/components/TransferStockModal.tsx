import { Modal, Form, Select, InputNumber, Input } from 'antd';
import { useActiveWarehouses } from '../hooks/useWarehouseDetail';

interface TransferStockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    fromWarehouseId: number;
    toWarehouseId: number;
    quantity: number;
    reason?: string;
  }) => Promise<void>;
  loading: boolean;
}

export const TransferStockModal = ({
  open,
  onClose,
  onSubmit,
  loading,
}: TransferStockModalProps) => {
  const [form] = Form.useForm();
  const { data: warehouses } = useActiveWarehouses();

  const handleFormSubmit = async (values: {
    fromWarehouseId: number;
    toWarehouseId: number;
    quantity: number;
    reason?: string;
  }) => {
    if (values.fromWarehouseId === values.toWarehouseId) {
      Modal.error({ content: 'Los almacenes de origen y destino no pueden ser iguales' });
      return;
    }
    await onSubmit(values);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Transferir Stock"
      open={open}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item
          label="Almacén Origen"
          name="fromWarehouseId"
          rules={[{ required: true, message: 'El almacén de origen es requerido' }]}
        >
          <Select
            placeholder="Seleccione almacén origen"
            options={warehouses?.map((w) => ({
              label: `${w.code} - ${w.name}`,
              value: w.id,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          label="Almacén Destino"
          name="toWarehouseId"
          rules={[{ required: true, message: 'El almacén de destino es requerido' }]}
        >
          <Select
            placeholder="Seleccione almacén destino"
            options={warehouses?.map((w) => ({
              label: `${w.code} - ${w.name}`,
              value: w.id,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          label="Cantidad"
          name="quantity"
          rules={[
            { required: true, message: 'La cantidad es requerida' },
            { type: 'number', min: 1, message: 'La cantidad debe ser al menos 1' },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={1} placeholder="Cantidad a transferir" />
        </Form.Item>

        <Form.Item label="Razón (Opcional)" name="reason">
          <Input.TextArea rows={2} placeholder="Motivo de la transferencia..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
