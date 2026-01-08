import { Table, Tag, Button, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { IconEye, IconX, IconDotsVertical } from '@tabler/icons-react';
import type { OrderSummaryResponse, OrderStatus } from '@types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../constants/orderStatus';
import { formatCurrency } from '@shared/utils/formatters';
import dayjs from 'dayjs';

interface OrderListProps {
  data?: OrderSummaryResponse[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (orderId: number) => void;
  onCancel: (orderId: number) => void;
}

export const OrderList = ({
  data,
  loading,
  page,
  pageSize,
  totalElements,
  onPageChange,
  onViewDetail,
  onCancel,
}: OrderListProps) => {
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (page * pageSize) + index + 1,
    },
    {
      title: 'N° Pedido',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
    },
    {
      title: 'Cliente',
      key: 'customer',
      render: (record: OrderSummaryResponse) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customerName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: OrderStatus) => (
        <Tag color={ORDER_STATUS_COLORS[status]}>
          {ORDER_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total: number) => formatCurrency(total),
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      align: 'center' as const,
      render: (record: OrderSummaryResponse) => {
        const canCancel = record.status !== 'CANCELLED' && record.status !== 'DELIVERED' && record.status !== 'REFUNDED';
        const items: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Ver detalles',
            icon: <IconEye size={16} />,
            onClick: () => onViewDetail(record.id),
          },
          ...(canCancel
            ? [
                {
                  type: 'divider' as const,
                },
                {
                  key: 'cancel',
                  label: 'Cancelar pedido',
                  icon: <IconX size={16} />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: '¿Cancelar pedido?',
                      content: 'Esta acción no se puede deshacer',
                      okText: 'Sí',
                      cancelText: 'No',
                      okButtonProps: { danger: true },
                      onOk: () => onCancel(record.id),
                    });
                  },
                },
              ]
            : []),
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<IconDotsVertical size={18} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data || []}
      rowKey="id"
      loading={loading}
      bordered
      pagination={{
        current: page + 1,
        pageSize,
        total: totalElements,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} pedidos`,
        onChange: onPageChange,
      }}
      scroll={{ x: 'max-content' }}
    />
  );
};
