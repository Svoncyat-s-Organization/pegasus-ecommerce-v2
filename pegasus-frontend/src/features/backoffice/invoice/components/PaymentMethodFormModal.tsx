import { Button, Form, Input, Modal, message } from 'antd';
import type { CreatePaymentMethodRequest, PaymentMethodResponse, UpdatePaymentMethodRequest } from '@types';
import { useCreateBillingPaymentMethod, useUpdateBillingPaymentMethod } from '../hooks/useBillingMutations';

interface PaymentMethodFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: PaymentMethodResponse | null;
  onCancel: () => void;
}

export const PaymentMethodFormModal = ({ open, mode, initialValue, onCancel }: PaymentMethodFormModalProps) => {
  const [form] = Form.useForm<{ name: string }>();
  const createMutation = useCreateBillingPaymentMethod();
  const updateMutation = useUpdateBillingPaymentMethod();

  const isEdit = mode === 'edit';

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      if (isEdit) {
        if (!initialValue?.id) return;
        const request: UpdatePaymentMethodRequest = { name: values.name.trim() };
        await updateMutation.mutateAsync({ id: initialValue.id, request });
      } else {
        const request: CreatePaymentMethodRequest = { name: values.name.trim() };
        await createMutation.mutateAsync(request);
      }
      onCancel();
    } catch {
      message.error('No se pudo guardar el método de pago');
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar método de pago' : 'Crear método de pago'}
      open={open}
      onCancel={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            type="primary"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit}
          >
            Guardar
          </Button>
        </>
      }
      afterOpenChange={(isOpen) => {
        if (!isOpen) return;
        form.resetFields();
        if (isEdit && initialValue) {
          form.setFieldsValue({ name: initialValue.name });
        }
      }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingresa el nombre' }]}>
          <Input placeholder="Yape" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
