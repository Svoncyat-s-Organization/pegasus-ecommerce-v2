import { Modal, Form, Select, Input, Button } from 'antd';
import { useState } from 'react';
import type { OrderStatus } from '@types';
import { ORDER_STATUS_LABELS, getAvailableStatuses } from '../constants/orderStatus';
import { useOrderMutations } from '../hooks/useOrderMutations';

const { TextArea } = Input;

interface UpdateStatusModalProps {
  orderId: number | null;
  currentStatus: OrderStatus | null;
  open: boolean;
  onClose: () => void;
}

export const UpdateStatusModal = ({ orderId, currentStatus, open, onClose }: UpdateStatusModalProps) => {
  const [form] = Form.useForm();
  const { updateStatus, isUpdating } = useOrderMutations();
  const [availableStatuses, setAvailableStatuses] = useState<OrderStatus[]>([]);

  // Update available statuses when modal opens
  useState(() => {
    if (currentStatus) {
      setAvailableStatuses(getAvailableStatuses(currentStatus));
    }
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (orderId) {
        await updateStatus({
          orderId,
          request: {
            status: values.status,
            notes: values.notes,
          },
        });
        form.resetFields();
        onClose();
      }
    } catch (error) {
      // Form validation error or mutation error (handled in hook)
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Actualizar Estado del Pedido"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isUpdating}
          onClick={handleSubmit}
        >
          Actualizar
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        {currentStatus && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <strong>Estado actual:</strong> {ORDER_STATUS_LABELS[currentStatus]}
          </div>
        )}

        <Form.Item
          label="Nuevo Estado"
          name="status"
          rules={[{ required: true, message: 'Seleccione el nuevo estado' }]}
        >
          <Select
            placeholder="Seleccione un estado"
            options={availableStatuses.map((status) => ({
              label: ORDER_STATUS_LABELS[status],
              value: status,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Notas (opcional)"
          name="notes"
        >
          <TextArea
            rows={4}
            placeholder="Agregue notas o comentarios sobre este cambio de estado..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
