import { Alert, Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, message } from 'antd';
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
}

export const InvoiceFormModal = ({ open, onCancel }: InvoiceFormModalProps) => {
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
    const orders = ordersData?.content || [];
    return orders.map((o: OrderSummaryResponse) => ({
      value: o.id,
      label: `${o.orderNumber} - ${o.customerName}`,
    }));
  }, [ordersData]);

  const ordersById = useMemo(() => {
    const map = new Map<number, OrderSummaryResponse>();
    for (const o of (ordersData?.content || [])) {
      map.set(o.id, o);
    }
    return map;
  }, [ordersData]);

  const isOrderPaid = selectedOrder?.status === 'PAID';

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
  const autoSeriesPreview = selectedSeries?.series;
  const autoNumberPreview = selectedSeries ? padInvoiceNumber((selectedSeries.currentNumber || 0) + 1) : undefined;

  const handleSubmit = async () => {
    if (selectedOrder && !isOrderPaid) {
      message.warning('No se puede emitir un comprobante si el pedido no está pagado');
      return;
    }

    const values = await form.validateFields();

    const request: CreateInvoiceRequest = {
      orderId: Number(values.orderId),
      invoiceType: values.invoiceType,
      ...(values.seriesId ? { seriesId: Number(values.seriesId) } : {
        series: String(values.series).trim(),
        number: String(values.number).trim(),
      }),
      receiverTaxId: String(values.receiverTaxId).trim(),
      receiverName: String(values.receiverName).trim(),
      subtotal: Number(values.subtotal),
      taxAmount: Number(values.taxAmount),
      totalAmount: Number(values.totalAmount),
      issuedAt: values.issuedAt ? values.issuedAt.toISOString() : undefined,
    };

    try {
      await createInvoice.mutateAsync(request);
      onCancel();
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
            disabled={!!selectedOrder && !isOrderPaid}
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
            <Form.Item name="seriesId" label="Serie configurada">
              <Select
                placeholder="Opcional"
                allowClear
                loading={isLoadingSeries}
                disabled={!invoiceType}
                options={(invoiceType ? seriesOptionsByType.get(invoiceType) : []) || []}
                onChange={(value) => {
                  if (value) {
                    form.setFieldsValue({ series: undefined, number: undefined });
                  }
                }}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {selectedSeries ? (
              <Form.Item label="Serie">
                <Input value={autoSeriesPreview} disabled />
              </Form.Item>
            ) : (
              <Form.Item
                name="series"
                label="Serie"
                rules={[{ required: !seriesId, message: 'Ingresa la serie' }]}
              >
                <Input placeholder="F001" maxLength={4} />
              </Form.Item>
            )}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            {selectedSeries ? (
              <Form.Item label="Número">
                <Input value={autoNumberPreview} disabled />
              </Form.Item>
            ) : (
              <Form.Item
                name="number"
                label="Número"
                rules={[{ required: !seriesId, message: 'Ingresa el número' }]}
              >
                <Input placeholder="00000001" maxLength={8} />
              </Form.Item>
            )}
          </Col>
        </Row>

        {!!selectedOrder && !isOrderPaid && (
          <Alert
            type="warning"
            showIcon
            message="El pedido seleccionado no está pagado"
            description="Registra el pago antes de emitir el comprobante."
            style={{ marginBottom: 16 }}
          />
        )}

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
