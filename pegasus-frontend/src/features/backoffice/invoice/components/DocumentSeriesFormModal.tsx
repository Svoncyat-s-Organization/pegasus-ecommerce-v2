import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, message } from 'antd';
import { useEffect } from 'react';
import type { CreateDocumentSeriesRequest, DocumentSeriesResponse, DocumentSeriesType, UpdateDocumentSeriesRequest } from '@types';
import { useCreateBillingDocumentSeries, useUpdateBillingDocumentSeries } from '../hooks/useBillingDocumentSeriesMutations';

const DOCUMENT_TYPE_LABEL: Record<DocumentSeriesType, string> = {
  BILL: 'Boleta',
  INVOICE: 'Factura',
  CREDIT_NOTE: 'Nota de crédito',
};

interface DocumentSeriesFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: DocumentSeriesResponse | null;
  onCancel: () => void;
}

export const DocumentSeriesFormModal = ({ open, mode, initialValue, onCancel }: DocumentSeriesFormModalProps) => {
  const [form] = Form.useForm();
  const createMutation = useCreateBillingDocumentSeries();
  const updateMutation = useUpdateBillingDocumentSeries();

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialValue) {
      form.setFieldsValue({
        documentType: initialValue.documentType,
        series: initialValue.series,
        currentNumber: initialValue.currentNumber,
      });
      return;
    }

    form.resetFields();
  }, [open, mode, initialValue, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      if (mode === 'create') {
        const request: CreateDocumentSeriesRequest = {
          documentType: values.documentType,
          series: String(values.series).trim(),
          currentNumber: typeof values.currentNumber === 'number' ? values.currentNumber : undefined,
        };
        await createMutation.mutateAsync(request);
      } else {
        if (!initialValue?.id) {
          message.error('No se encontró la serie a editar');
          return;
        }

        const request: UpdateDocumentSeriesRequest = {
          series: String(values.series).trim(),
          currentNumber: typeof values.currentNumber === 'number' ? values.currentNumber : undefined,
        };

        await updateMutation.mutateAsync({ id: initialValue.id, request });
      }

      onCancel();
    } catch {
      // Error message handled by mutation
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={mode === 'create' ? 'Nueva serie' : 'Editar serie'}
      open={open}
      onCancel={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" loading={isSaving} onClick={handleSubmit}>
            Guardar
          </Button>
        </>
      }
      width={720}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="documentType"
              label="Tipo de documento"
              rules={[{ required: true, message: 'Selecciona el tipo de documento' }]}
            >
              <Select
                placeholder="Seleccione"
                disabled={mode === 'edit'}
                options={(Object.keys(DOCUMENT_TYPE_LABEL) as DocumentSeriesType[]).map((t) => ({
                  value: t,
                  label: DOCUMENT_TYPE_LABEL[t],
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="series"
              label="Serie"
              rules={[{ required: true, message: 'Ingresa la serie' }]}
            >
              <Input placeholder="F001" maxLength={4} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="currentNumber" label="Correlativo actual">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
