import { Button, Form, Modal, Select } from 'antd';
import type { InvoiceStatus } from '@types';
import { INVOICE_STATUS_META } from '../constants/billingConstants';
import { useUpdateBillingInvoiceStatus } from '../hooks/useBillingMutations';

interface InvoiceStatusModalProps {
  open: boolean;
  invoiceId: number | null;
  currentStatus: InvoiceStatus | null;
  onCancel: () => void;
}

export const InvoiceStatusModal = ({ open, invoiceId, currentStatus, onCancel }: InvoiceStatusModalProps) => {
  const [form] = Form.useForm<{ status: InvoiceStatus }>();
  const updateStatus = useUpdateBillingInvoiceStatus();

  const handleOk = async () => {
    if (invoiceId === null) return;
    const values = await form.validateFields();
    updateStatus.mutate(
      { id: invoiceId, request: values },
      {
        onSuccess: () => {
          onCancel();
        },
      }
    );
  };

  return (
    <Modal
      title="Actualizar estado"
      open={open}
      onCancel={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" loading={updateStatus.isPending} onClick={handleOk}>
            Guardar
          </Button>
        </>
      }
      afterClose={() => form.resetFields()}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: currentStatus ?? undefined }}
        onValuesChange={(_, values) => {
          form.setFieldsValue(values);
        }}
      >
        <Form.Item name="status" label="Estado" rules={[{ required: true, message: 'Selecciona un estado' }]}>
          <Select
            options={(Object.keys(INVOICE_STATUS_META) as InvoiceStatus[]).map((status) => ({
              value: status,
              label: INVOICE_STATUS_META[status].text,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
