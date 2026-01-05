import { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Checkbox, message } from 'antd';
import { TRACKING_EVENT_STATUSES } from '../constants';
import { useCreateTrackingEvent } from '../hooks/useTrackingEvents';
import dayjs from 'dayjs';
import type { CreateTrackingEventRequest } from '@types';

const { Option } = Select;

interface TrackingEventFormModalProps {
  open: boolean;
  onCancel: () => void;
  shipmentId: number;
}

export const TrackingEventFormModal = ({
  open,
  onCancel,
  shipmentId,
}: TrackingEventFormModalProps) => {
  const [form] = Form.useForm();
  const createMutation = useCreateTrackingEvent();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        eventDate: dayjs(),
        isPublic: true,
      });
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData: CreateTrackingEventRequest = {
        shipmentId,
        status: values.status,
        description: values.eventDescription,
        location: values.location,
        eventDate: values.eventDate?.toISOString(),
        isPublic: values.isPublic,
      };

      await createMutation.mutateAsync(submitData);
      message.success('Evento de tracking creado exitosamente');
      form.resetFields();
      onCancel();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Error al crear el evento de tracking');
    }
  };

  return (
    <Modal
      title="Agregar Evento de Tracking"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={createMutation.isPending}
      okText="Crear"
      cancelText="Cancelar"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Estado"
          name="status"
          rules={[{ required: true, message: 'El estado es requerido' }]}
        >
          <Select placeholder="Seleccione el estado">
            {Object.entries(TRACKING_EVENT_STATUSES).map(([key, label]) => (
              <Option key={key} value={key}>
                {label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Descripción del Evento"
          name="eventDescription"
          rules={[
            { required: true, message: 'La descripción es requerida' },
            { max: 255, message: 'Máximo 255 caracteres' },
          ]}
        >
          <Input placeholder="El paquete ha llegado al centro de distribución" />
        </Form.Item>

        <Form.Item
          label="Ubicación"
          name="location"
          rules={[{ max: 255, message: 'Máximo 255 caracteres' }]}
        >
          <Input placeholder="Centro de Distribución Lima" />
        </Form.Item>

        <Form.Item
          label="Fecha del Evento"
          name="eventDate"
          rules={[{ required: true, message: 'La fecha del evento es requerida' }]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            placeholder="Seleccione fecha y hora"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item name="isPublic" valuePropName="checked" initialValue={true}>
          <Checkbox>Evento público (visible para el cliente)</Checkbox>
        </Form.Item>

        <Form.Item
          label="Notas Internas (opcional)"
          name="notes"
          tooltip="Estas notas son solo para uso interno"
        >
          <Input.TextArea rows={3} placeholder="Notas adicionales sobre el evento..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
