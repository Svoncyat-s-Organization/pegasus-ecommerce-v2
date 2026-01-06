import { Modal, Form, Select, Table, InputNumber, Input, Typography, Space } from 'antd';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@shared/hooks/useDebounce';
import { getOrders, getOrderById } from '@features/backoffice/order/api/ordersApi';
import { getRmasByOrder } from '../api/rmasApi';
import { RMA_REASON_LABELS } from '../constants/rmaConstants';
import type { CreateRmaRequest, OrderItemResponse, OrderSummaryResponse, RmaReason } from '@types';

const { Text } = Typography;
const { TextArea } = Input;

interface CreateRmaModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateRmaRequest) => Promise<void>;
  isLoading: boolean;
}

type ReturnItemDraft = {
  orderItemId: number;
  variantId: number;
  sku: string;
  productName: string;
  purchasedQuantity: number;
  returnQuantity: number;
};

export const CreateRmaModal = ({ open, onClose, onSubmit, isLoading }: CreateRmaModalProps) => {
  const [form] = Form.useForm();
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>();
  const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({});

  const debouncedOrderSearch = useDebounce(orderSearch, 400);

  const { data: eligibleDeliveredOrders, isFetching: isLoadingOrders } = useQuery({
    queryKey: ['rma', 'eligible-orders', debouncedOrderSearch],
    queryFn: async () => {
      const page = await getOrders(0, 50, debouncedOrderSearch || undefined, 'DELIVERED');
      const orders = page.content ?? [];

      const eligibility = await Promise.all(
        orders.map(async (o) => {
          try {
            const rmasPage = await getRmasByOrder(o.id, 0, 1);
            return { order: o, eligible: (rmasPage.totalElements ?? 0) === 0 };
          } catch {
            // If we can't check, be conservative and hide it
            return { order: o, eligible: false };
          }
        })
      );

      return eligibility.filter((x) => x.eligible).map((x) => x.order);
    },
    enabled: open,
  });

  const { data: orderDetail, isFetching: isLoadingOrderDetail } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => getOrderById(selectedOrderId!),
    enabled: open && !!selectedOrderId,
  });

  const orderOptions = useMemo(() => {
    const content = eligibleDeliveredOrders ?? [];
    return content.map((o: OrderSummaryResponse) => ({
      value: o.id,
      label: `${o.orderNumber} — ${o.customerName}`,
    }));
  }, [eligibleDeliveredOrders]);

  const orderItems: ReturnItemDraft[] = useMemo(() => {
    if (!orderDetail) return [];
    return (orderDetail.items ?? []).map((it: OrderItemResponse) => ({
      orderItemId: it.id,
      variantId: it.variantId,
      sku: it.sku,
      productName: it.productName,
      purchasedQuantity: it.quantity,
      returnQuantity: returnQuantities[it.id] ?? 0,
    }));
  }, [orderDetail, returnQuantities]);

  const handleOrderChange = (orderId: number) => {
    setSelectedOrderId(orderId);
    setReturnQuantities({});
    form.setFieldsValue({ orderId });
  };

  const handleQuantityChange = (orderItemId: number, value: number | null) => {
    const qty = value ?? 0;
    setReturnQuantities((prev) => ({ ...prev, [orderItemId]: qty }));
  };

  const canSubmit = useMemo(() => {
    return orderItems.some((it) => it.returnQuantity > 0);
  }, [orderItems]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!canSubmit) {
        form.setFields([
          {
            name: 'items',
            errors: ['Seleccione al menos un item con cantidad a devolver'],
          },
        ]);
        return;
      }

      const request: CreateRmaRequest = {
        orderId: values.orderId,
        reason: values.reason as RmaReason,
        customerComments: values.customerComments || undefined,
        items: orderItems
          .filter((it) => it.returnQuantity > 0)
          .map((it) => ({
            orderItemId: it.orderItemId,
            variantId: it.variantId,
            quantity: it.returnQuantity,
          })),
      };

      await onSubmit(request);
      handleCancel();
    } catch {
      // handled in parent or form
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOrderSearch('');
    setSelectedOrderId(undefined);
    setReturnQuantities({});
    onClose();
  };

  const itemColumns = [
    {
      title: 'Producto',
      key: 'product',
      render: (_: unknown, record: ReturnItemDraft) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.productName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            SKU: {record.sku}
          </Text>
        </div>
      ),
    },
    {
      title: 'Comprado',
      dataIndex: 'purchasedQuantity',
      key: 'purchasedQuantity',
      width: 110,
    },
    {
      title: 'Devolver',
      key: 'returnQuantity',
      width: 150,
      render: (_: unknown, record: ReturnItemDraft) => (
        <InputNumber
          min={0}
          max={record.purchasedQuantity}
          value={record.returnQuantity}
          onChange={(v) => handleQuantityChange(record.orderItemId, v)}
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Nueva devolución"
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={isLoading}
      okText="Crear devolución"
      cancelText="Cancelar"
      width={900}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="orderId"
          label="Pedido entregado"
          rules={[{ required: true, message: 'Seleccione un pedido entregado' }]}
        >
          <Select
            showSearch
            placeholder="Buscar por N° pedido o cliente"
            loading={isLoadingOrders}
            filterOption={false}
            onSearch={(v) => setOrderSearch(v)}
            onChange={(v) => handleOrderChange(v)}
            options={orderOptions}
            notFoundContent={isLoadingOrders ? 'Cargando...' : 'Sin resultados'}
          />
        </Form.Item>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Form.Item
            name="reason"
            label="Motivo de devolución"
            rules={[{ required: true, message: 'Seleccione el motivo' }]}
          >
            <Select
              placeholder="Seleccione"
              options={Object.entries(RMA_REASON_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>

          <Form.Item name="customerComments" label="Comentarios">
            <TextArea placeholder="Detalle adicional (opcional)" rows={3} maxLength={500} />
          </Form.Item>

          <Form.Item name="items" style={{ marginBottom: 0 }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Items a devolver</Text>
              {selectedOrderId && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {isLoadingOrderDetail ? 'Cargando items...' : ''}
                </Text>
              )}
            </div>
            <Table
              rowKey="orderItemId"
              dataSource={orderItems}
              columns={itemColumns}
              pagination={false}
              size="small"
              locale={{ emptyText: selectedOrderId ? 'Sin items' : 'Seleccione un pedido para ver items' }}
            />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};
