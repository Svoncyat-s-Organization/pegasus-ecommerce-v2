import { useEffect } from 'react';
import { Modal, Form, Select } from 'antd';
import type { PurchaseStatus } from '@types';
import { PURCHASE_STATUS } from '../constants/purchaseConstants';
import { useUpdatePurchaseStatus } from '../hooks/usePurchaseMutations';

interface PurchaseStatusModalProps {
  open: boolean;
  purchaseId: number | null;
  currentStatus: PurchaseStatus | null;
  onCancel: () => void;
}

export const PurchaseStatusModal = ({
  open,
  purchaseId,
  currentStatus,
  onCancel,
}: PurchaseStatusModalProps) => {
  const [form] = Form.useForm();
  const updateStatus = useUpdatePurchaseStatus();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ status: currentStatus || undefined });
  }, [open, currentStatus, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!purchaseId) return;

    await updateStatus.mutateAsync({
      id: purchaseId,
      request: { status: values.status },
    });

    onCancel();
  };

  return (
    <Modal
      title="Actualizar estado"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={updateStatus.isPending}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Estado"
          name="status"
          rules={[{ required: true, message: 'Seleccione un estado' }]}
        >
          <Select
            options={(Object.keys(PURCHASE_STATUS) as PurchaseStatus[]).map((status) => ({
              value: status,
              label: PURCHASE_STATUS[status].text,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
