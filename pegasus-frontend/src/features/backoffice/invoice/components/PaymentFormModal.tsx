import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, message } from 'antd';
import { useMemo, useState } from 'react';
import type { CreatePaymentRequest, OrderSummaryResponse } from '@types';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useBillingPaymentMethods } from '../hooks/useBillingPaymentMethods';
import { useCreateBillingPayment } from '../hooks/useBillingMutations';
import { useAdminOrders } from '../hooks/useAdminOrders';

interface PaymentFormModalProps {
  open: boolean;
  onCancel: () => void;
}

export const PaymentFormModal = ({ open, onCancel }: PaymentFormModalProps) => {
  const [form] = Form.useForm();
  const createPayment = useCreateBillingPayment();
  const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } = useBillingPaymentMethods(0, 200);

  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const debouncedOrderSearch = useDebounce(orderSearchTerm, 500);
  const { data: ordersData, isLoading: isLoadingOrders } = useAdminOrders(0, 20, debouncedOrderSearch || undefined);

  const ordersOptions = useMemo(() => {
    const orders = (ordersData?.content || []).filter((o: OrderSummaryResponse) => o.status !== 'PAID');
    return orders.map((o: OrderSummaryResponse) => ({
      value: o.id,
      label: `${o.orderNumber} - ${o.customerName}`,
    }));
  }, [ordersData]);

  const paymentMethodOptions = useMemo(() => {
    return (paymentMethodsData?.content || [])
      .filter((m) => m.isActive)
      .map((m) => ({ label: m.name, value: m.id }));
  }, [paymentMethodsData]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const request: CreatePaymentRequest = {
      orderId: Number(values.orderId),
      paymentMethodId: Number(values.paymentMethodId),
      amount: Number(values.amount),
      transactionId: values.transactionId ? String(values.transactionId).trim() : undefined,
      paymentDate: values.paymentDate ? values.paymentDate.toISOString() : undefined,
      notes: values.notes ? String(values.notes).trim() : undefined,
    };

    try {
      await createPayment.mutateAsync(request);
      onCancel();
    } catch {
      message.error('No se pudo registrar el pago');
    }
  };

  return (
    <Modal
      title="Registrar pago"
      open={open}
      onCancel={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" loading={createPayment.isPending} onClick={handleSubmit}>
            Guardar
          </Button>
        </>
      }
      afterOpenChange={(isOpen) => {
        if (!isOpen) return;
        form.resetFields();
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
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="paymentMethodId"
              label="Método de pago"
              rules={[{ required: true, message: 'Selecciona un método de pago' }]}
            >
              <Select
                placeholder="Seleccione"
                loading={isLoadingPaymentMethods}
                options={paymentMethodOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paymentDate" label="Fecha de pago">
              <DatePicker style={{ width: '100%' }} showTime placeholder="Seleccione" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="amount" label="Monto" rules={[{ required: true, message: 'Ingresa el monto' }]}>
              <InputNumber style={{ width: '100%' }} min={0.01} step={0.01} placeholder="0.00" />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="transactionId" label="Transaction ID">
              <Input placeholder="TX-123" maxLength={100} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Notas">
          <Input.TextArea placeholder="Opcional" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
