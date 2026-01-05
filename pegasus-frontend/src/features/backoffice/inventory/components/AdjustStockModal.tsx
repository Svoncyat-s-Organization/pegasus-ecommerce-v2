import { Modal, Form, InputNumber, Input } from 'antd';

interface AdjustStockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { quantityChange: number; reason: string }) => Promise<void>;
  loading: boolean;
}

export const AdjustStockModal = ({ open, onClose, onSubmit, loading }: AdjustStockModalProps) => {
  const [form] = Form.useForm();

  const handleFormSubmit = async (values: { quantityChange: number; reason: string }) => {
    await onSubmit(values);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Ajustar Stock"
      open={open}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <Form.Item
          label="Cambio de Cantidad"
          name="quantityChange"
          rules={[
            { required: true, message: 'El cambio de cantidad es requerido' },
            {
              type: 'number',
              message: 'Debe ser un número válido',
            },
          ]}
          help="Use números negativos para reducir stock, positivos para aumentar"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Ej: 10 o -5"
          />
        </Form.Item>

        <Form.Item
          label="Razón del Ajuste"
          name="reason"
          rules={[{ required: true, message: 'La razón es requerida' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Describa el motivo del ajuste..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
