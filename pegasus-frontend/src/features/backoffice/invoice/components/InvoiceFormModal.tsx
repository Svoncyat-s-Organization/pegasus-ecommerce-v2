import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, message } from 'antd';
import { useMemo, useState } from 'react';
import type { CreateInvoiceRequest, DocumentSeriesResponse, InvoiceType, OrderSummaryResponse } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { INVOICE_TYPE_LABEL } from '../constants/billingConstants';
import { useCreateBillingInvoice } from '../hooks/useBillingMutations';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useBillingDocumentSeries } from '../hooks/useBillingDocumentSeries';

interface InvoiceFormModalProps {
  open: boolean;
  onCancel: () => void;
  onCreated?: (invoiceId: number) => void;
}

export const InvoiceFormModal = ({ open, onCancel, onCreated }: InvoiceFormModalProps) => {
  const [form] = Form.useForm();
  const createInvoice = useCreateBillingInvoice();

  const invoiceType = Form.useWatch<InvoiceType>('invoiceType', form);
  const seriesId = Form.useWatch<number | undefined>('seriesId', form);

  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const debouncedOrderSearch = useDebounce(orderSearchTerm, 500);
  const { data: ordersData, isLoading: isLoadingOrders } = useAdminOrders(0, 20, debouncedOrderSearch || undefined);

  const [selectedOrder, setSelectedOrder] = useState<OrderSummaryResponse | undefined>(undefined);

  const { data: documentSeriesData, isLoading: isLoadingSeries } = useBillingDocumentSeries(0, 200);

  const ordersOptions = useMemo(() => {
    const orders = (ordersData?.content || []).filter((o: OrderSummaryResponse) => o.status === 'PAID');
    return orders.map((o: OrderSummaryResponse) => ({
      value: o.id,
      label: `${o.orderNumber} - ${o.customerName}`,
    }));
  }, [ordersData]);

  const ordersById = useMemo(() => {
    const map = new Map<number, OrderSummaryResponse>();
    for (const o of (ordersData?.content || []).filter((o: OrderSummaryResponse) => o.status === 'PAID')) {
      map.set(o.id, o);
    }
    return map;
  }, [ordersData]);

  const activeSeriesList = useMemo(() => {
    return (documentSeriesData?.content || []).filter((s: DocumentSeriesResponse) => s.isActive);
  }, [documentSeriesData]);

  const seriesOptionsByType = useMemo(() => {
    const byType = new Map<InvoiceType, { value: number; label: string }[]>();
    byType.set('BILL', []);
    byType.set('INVOICE', []);

    for (const s of activeSeriesList) {
      if (s.documentType === 'BILL') {
        byType.get('BILL')?.push({ value: s.id, label: `${s.series} (Correlativo: ${s.currentNumber})` });
      }
      if (s.documentType === 'INVOICE') {
        byType.get('INVOICE')?.push({ value: s.id, label: `${s.series} (Correlativo: ${s.currentNumber})` });
      }
    }

    return byType;
  }, [activeSeriesList]);

  const seriesById = useMemo(() => {
    const map = new Map<number, DocumentSeriesResponse>();
    for (const s of activeSeriesList) {
      map.set(s.id, s);
    }
    return map;
  }, [activeSeriesList]);

  const padInvoiceNumber = (value: number): string => String(value).padStart(8, '0');
  const selectedSeries = typeof seriesId === 'number' ? seriesById.get(seriesId) : undefined;
  const autoNumberPreview = selectedSeries ? padInvoiceNumber((selectedSeries.currentNumber || 0) + 1) : undefined;

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const request: CreateInvoiceRequest = {
      orderId: Number(values.orderId),
      invoiceType: values.invoiceType,
      seriesId: Number(values.seriesId),
      receiverTaxId: String(values.receiverTaxId).trim(),
      receiverName: String(values.receiverName).trim(),
      subtotal: Number(values.subtotal),
      taxAmount: Number(values.taxAmount),
      totalAmount: Number(values.totalAmount),
      issuedAt: values.issuedAt ? values.issuedAt.toISOString() : undefined,
    };

    try {
      const created = await createInvoice.mutateAsync(request);
      onCancel();
      onCreated?.(created.id);
    } catch {
      message.error('No se pudo crear el comprobante');
    }
  };

  return (
    <Modal
      title="Crear comprobante"
      open={open}
      onCancel={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            type="primary"
            loading={createInvoice.isPending}
            onClick={handleSubmit}
          >
            Crear
          </Button>
        </>
      }
      afterOpenChange={(isOpen) => {
        if (!isOpen) return;
        form.resetFields();
        setSelectedOrder(undefined);
      }}
      width={860}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="orderId" label="Pedido" rules={[{ required: true, message: 'Selecciona un pedido' }]}>
              <Select
                placeholder="Buscar pedido..."
                showSearch
                filterOption={false}
                onSearch={(value) => setOrderSearchTerm(value)}
                options={ordersOptions}
                loading={isLoadingOrders}
                optionFilterProp="label"
                onChange={(value) => {
                  const id = typeof value === 'number' ? value : Number(value);
                  const order = ordersById.get(id);
                  setSelectedOrder(order);

                  if (order) {
                    form.setFieldsValue({
                      receiverName: order.customerName,
                      receiverTaxId: order.customerDocNumber || undefined,
                      totalAmount: order.total,
                      subtotal: order.total,
                      taxAmount: 0,
                    });
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="invoiceType" label="Tipo" rules={[{ required: true, message: 'Selecciona el tipo' }]}>
              <Select
                placeholder="Seleccione"
                onChange={() => {
                  form.setFieldsValue({ seriesId: undefined });
                }}
                options={(Object.keys(INVOICE_TYPE_LABEL) as InvoiceType[]).map((type) => ({
                  value: type,
                  label: INVOICE_TYPE_LABEL[type],
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="issuedAt" label="Fecha de emisión">
              <DatePicker style={{ width: '100%' }} showTime placeholder="Seleccione" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="seriesId"
              label="Serie"
              rules={[{ required: true, message: 'Selecciona una serie' }]}
            >
              <Select
                placeholder="Seleccione"
                loading={isLoadingSeries}
                disabled={!invoiceType}
                options={(invoiceType ? seriesOptionsByType.get(invoiceType) : []) || []}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Correlativo">
              <Input value={autoNumberPreview} placeholder="Seleccione una serie" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="receiverTaxId"
              label="Documento receptor"
              rules={[{ required: true, message: 'Ingresa el documento del receptor' }]}
            >
              <Input
                placeholder="12345678"
                maxLength={20}
                addonBefore={selectedOrder?.customerDocType || undefined}
                disabled={!!selectedOrder?.customerDocNumber}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="receiverName"
              label="Nombre receptor"
              rules={[{ required: true, message: 'Ingresa el nombre del receptor' }]}
            >
              <Input placeholder="Juan Pérez" maxLength={150} disabled={!!selectedOrder?.customerName} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="subtotal" label="Subtotal" rules={[{ required: true, message: 'Ingresa el subtotal' }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="0.00" disabled={!!selectedOrder} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="taxAmount" label="IGV" rules={[{ required: true, message: 'Ingresa el IGV' }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="0.00" disabled={!!selectedOrder} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="totalAmount" label="Total" rules={[{ required: true, message: 'Ingresa el total' }]}>
              <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} placeholder="0.00" disabled={!!selectedOrder} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
