import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { CreateInvoiceRequest, DocumentSeriesResponse, InvoiceType, OrderSummaryResponse } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { INVOICE_TYPE_LABEL } from '../constants/billingConstants';
import { useCreateBillingInvoice } from '../hooks/useBillingMutations';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useInvoicedOrderIds } from '../hooks/useBillingInvoices';
import { useBillingDocumentSeries } from '../hooks/useBillingDocumentSeries';

type InitialOrderInfo = {
  id: number;
  orderNumber: string;
  customerName: string;
};

interface InvoiceFormModalProps {
  open: boolean;
  onCancel: () => void;
  onCreated?: (invoiceId: number) => void;
  initialOrder?: InitialOrderInfo;
  lockOrder?: boolean;
}

export const InvoiceFormModal = ({ open, onCancel, onCreated, initialOrder, lockOrder }: InvoiceFormModalProps) => {
  const [form] = Form.useForm();
  const createInvoice = useCreateBillingInvoice();

  const invoiceType = Form.useWatch<InvoiceType>('invoiceType', form);
  const seriesId = Form.useWatch<number | undefined>('seriesId', form);

  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const debouncedOrderSearch = useDebounce(orderSearchTerm, 500);
  const { data: ordersData, isLoading: isLoadingOrders } = useAdminOrders(0, 20, debouncedOrderSearch || undefined);

  const isOrderLocked = !!initialOrder && lockOrder !== false;
  const [selectedOrder, setSelectedOrder] = useState<OrderSummaryResponse | undefined>(undefined);

  const { data: documentSeriesData, isLoading: isLoadingSeries } = useBillingDocumentSeries(0, 200);

  const paidOrders = useMemo(() => {
    return (ordersData?.content || []).filter((o: OrderSummaryResponse) => o.status === 'PAID');
  }, [ordersData]);

  const paidOrderIds = useMemo(() => {
    return paidOrders
      .map((o) => o.id)
      .filter((id): id is number => typeof id === 'number')
      .sort((a, b) => a - b);
  }, [paidOrders]);

  const { data: invoicedOrderIds, isLoading: isLoadingInvoicedOrderIds } = useInvoicedOrderIds(paidOrderIds);
  const invoicedOrderIdSet = useMemo(() => new Set(invoicedOrderIds || []), [invoicedOrderIds]);

  const eligiblePaidOrders = useMemo(() => {
    return paidOrders.filter((o) => !invoicedOrderIdSet.has(o.id));
  }, [paidOrders, invoicedOrderIdSet]);

  const ordersById = useMemo(() => {
    const map = new Map<number, OrderSummaryResponse>();
    for (const o of eligiblePaidOrders) {
      map.set(o.id, o);
    }
    return map;
  }, [eligiblePaidOrders]);

  const ordersOptions = useMemo(() => {
    const options = eligiblePaidOrders.map((o: OrderSummaryResponse) => ({
      value: o.id,
      label: `${o.orderNumber} - ${o.customerName}`,
    }));

    if (initialOrder) {
      const exists = options.some((o) => o.value === initialOrder.id);
      if (!exists) {
        options.unshift({
          value: initialOrder.id,
          label: `${initialOrder.orderNumber} - ${initialOrder.customerName}`,
        });
      }
    }

    return options;
  }, [eligiblePaidOrders, initialOrder]);

  const activeSeriesList = useMemo(() => {
    return (documentSeriesData?.content || []).filter((s: DocumentSeriesResponse) => s.isActive);
  }, [documentSeriesData]);

  const availableInvoiceTypes = useMemo(() => {
    const types = new Set<InvoiceType>();
    for (const s of activeSeriesList) {
      types.add(s.documentType as InvoiceType);
    }
    return (['BILL', 'INVOICE', 'CREDIT_NOTE'] as InvoiceType[]).filter((t) => types.has(t));
  }, [activeSeriesList]);

  const seriesOptionsByType = useMemo(() => {
    const byType = new Map<InvoiceType, { value: number; label: string }[]>();
    for (const t of availableInvoiceTypes) {
      byType.set(t, []);
    }

    for (const s of activeSeriesList) {
      byType.get(s.documentType as InvoiceType)?.push({
        value: s.id,
        label: `${s.series} (Correlativo: ${s.currentNumber})`,
      });
    }

    return byType;
  }, [activeSeriesList, availableInvoiceTypes]);

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

  const applySelectedOrderToForm = (order: OrderSummaryResponse | undefined) => {
    setSelectedOrder(order);
    if (!order) return;
    form.setFieldsValue({
      receiverName: order.customerName,
      receiverTaxId: order.customerDocNumber || undefined,
      totalAmount: order.total,
      subtotal: order.total,
      taxAmount: 0,
    });
  };

  // If opened with a preselected order, auto-fill when it appears in the eligible list.
  useEffect(() => {
    if (!open) return;
    if (!initialOrder) return;
    const order = ordersById.get(initialOrder.id);
    if (!order) return;
    applySelectedOrderToForm(order);
  }, [open, initialOrder, ordersById]);

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
          <Button type="primary" loading={createInvoice.isPending} onClick={handleSubmit}>
            Crear
          </Button>
        </>
      }
      afterOpenChange={(isOpen) => {
        if (!isOpen) return;
        form.resetFields();
        setSelectedOrder(undefined);
        setOrderSearchTerm(initialOrder?.orderNumber ?? '');
        if (initialOrder) {
          form.setFieldsValue({ orderId: initialOrder.id });
        }
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
                onSearch={(value) => {
                  if (isOrderLocked) return;
                  setOrderSearchTerm(value);
                }}
                options={ordersOptions}
                loading={isLoadingOrders || isLoadingInvoicedOrderIds}
                optionFilterProp="label"
                disabled={isOrderLocked}
                onChange={(value) => {
                  const id = typeof value === 'number' ? value : Number(value);
                  const order = ordersById.get(id);
                  applySelectedOrderToForm(order);
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
                options={availableInvoiceTypes.map((type) => ({ value: type, label: INVOICE_TYPE_LABEL[type] }))}
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
            <Form.Item name="seriesId" label="Serie" rules={[{ required: true, message: 'Selecciona una serie' }]}>
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
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="0.00"
                disabled={!!selectedOrder}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="taxAmount" label="IGV" rules={[{ required: true, message: 'Ingresa el IGV' }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="0.00" disabled={!!selectedOrder} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="totalAmount" label="Total" rules={[{ required: true, message: 'Ingresa el total' }]}>
              <InputNumber
                style={{ width: '100%' }}
                min={0.01}
                step={0.01}
                placeholder="0.00"
                disabled={!!selectedOrder}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
