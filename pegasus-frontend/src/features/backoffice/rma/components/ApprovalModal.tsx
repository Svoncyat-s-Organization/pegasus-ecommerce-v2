import { Modal, Form, Radio, Input, Button, Alert } from 'antd';
import { useRmaMutations } from '../hooks/useRmaMutations';

const { TextArea } = Input;

interface ApprovalModalProps {
  rmaId: number | null;
  open: boolean;
  onClose: () => void;
}

export const ApprovalModal = ({ rmaId, open, onClose }: ApprovalModalProps) => {
  const [form] = Form.useForm();
  const { approveReject, isApproving } = useRmaMutations();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (rmaId) {
        await approveReject({
          rmaId,
          request: {
            approved: values.decision === 'approve',
            comments: values.comments,
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
      title="Aprobar o Rechazar RMA"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isApproving}
          onClick={handleSubmit}
        >
          Confirmar
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="Decisión"
          name="decision"
          rules={[{ required: true, message: 'Seleccione una opción' }]}
        >
          <Radio.Group>
            <Radio value="approve">Aprobar RMA</Radio>
            <Radio value="reject">Rechazar RMA</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Comentarios"
          name="comments"
          rules={[{ required: true, message: 'Agregue comentarios sobre su decisión' }]}
        >
          <TextArea
            rows={4}
            placeholder="Explique el motivo de su decisión..."
          />
        </Form.Item>

        <Alert
          message="Información"
          description="Si aprueba: el cliente podrá enviar los productos. Si rechaza: la solicitud será cerrada."
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Form>
    </Modal>
  );
};
