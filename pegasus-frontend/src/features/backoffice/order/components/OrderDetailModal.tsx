import { Modal, Descriptions, Table, Tag, Spin, Alert, Button, Divider } from 'antd';
import type { OrderItemResponse } from '@types';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../constants/orderStatus';
import { formatCurrency } from '@shared/utils/formatters';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import dayjs from 'dayjs';

interface OrderDetailModalProps {
  orderId: number | null;
  open: boolean;
  onClose: () => void;
}

export const OrderDetailModal = ({ orderId, open, onClose }: OrderDetailModalProps) => {
  const { data: order, isLoading, error, refetch } = useOrderDetail(orderId);

  const itemColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Producto',
      key: 'product',
      render: (item: OrderItemResponse) => (
        <div>
          <div style={{ fontWeight: 500 }}>{item.productName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>SKU: {item.sku}</div>
        </div>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Precio Unit.',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total: number) => formatCurrency(total),
    },
  ];

  return (
    <>
      <Modal
        title="Detalle del Pedido"
        open={open}
        onCancel={onClose}
        width={900}
        footer={<Button onClick={onClose}>Cerrar</Button>}
      >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}

      {error && (
        <Alert
          message="Error"
          description="No se pudo cargar el detalle del pedido"
          type="error"
          showIcon
        />
      )}

      {order && (
        <div>
          {/* Timeline de Estado del Pedido */}
          <OrderStatusTimeline
            order={order}
            onStatusChange={() => refetch()}
          />

          <Divider />

          {/* Información General */}
          <Descriptions title="Información General" bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="N° Pedido" span={2}>
              <strong>{order.orderNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cliente">
              <div>
                <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{order.customerEmail}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              <strong style={{ fontSize: 16 }}>{formatCurrency(order.total)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha Creación">
              {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>

          {/* Direcciones */}
          <Descriptions title="Dirección de Envío" bordered column={1} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Dirección">
              {order.shippingAddress.address}
            </Descriptions.Item>
            {order.shippingAddress.reference && (
              <Descriptions.Item label="Referencia">
                {order.shippingAddress.reference}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Destinatario">
              {order.shippingAddress.recipientName}
            </Descriptions.Item>
            <Descriptions.Item label="Teléfono">
              +51 {order.shippingAddress.recipientPhone}
            </Descriptions.Item>
          </Descriptions>

          {/* Items del Pedido */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Items del Pedido</h3>
            <Table
              columns={itemColumns}
              dataSource={order.items}
              rowKey="id"
              pagination={false}
              bordered
              size="small"
            />
          </div>
        </div>
      )}
      </Modal>
    </>
  );
};
