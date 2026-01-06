import { Table, Tag, Button, Space, Popconfirm, Badge } from 'antd';
import { IconEye, IconX } from '@tabler/icons-react';
import type { RmaSummaryResponse, RmaStatus } from '@types';
import { RMA_STATUS_LABELS, RMA_STATUS_COLORS, RMA_REASON_LABELS, isActionAvailable } from '../constants/rmaConstants';
import { formatCurrency } from '@shared/utils/formatters';
import dayjs from 'dayjs';

interface RmaListProps {
  data?: RmaSummaryResponse[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (rmaId: number) => void;
  onCancel: (rmaId: number) => void;
}

export const RmaList = ({
  data,
  loading,
  page,
  pageSize,
  totalElements,
  onPageChange,
  onViewDetail,
  onCancel,
}: RmaListProps) => {
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: RmaSummaryResponse, index: number) => (page * pageSize) + index + 1,
    },
    {
      title: 'N° RMA',
      dataIndex: 'rmaNumber',
      key: 'rmaNumber',
      width: 150,
    },
    {
      title: 'N° Pedido',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
    },
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: RmaStatus) => (
        <Tag color={RMA_STATUS_COLORS[status]}>
          {RMA_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      width: 180,
      render: (reason: string) => RMA_REASON_LABELS[reason as keyof typeof RMA_REASON_LABELS],
    },
    {
      title: 'Items',
      dataIndex: 'itemsCount',
      key: 'itemsCount',
      width: 80,
      align: 'center' as const,
      render: (count: number) => <Badge count={count} showZero />,
    },
    {
      title: 'Monto Reembolso',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 140,
      render: (amount: number) => formatCurrency(amount),
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
      width: 110,
      render: (record: RmaSummaryResponse) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<IconEye size={16} />}
            title="Ver detalles"
            onClick={() => onViewDetail(record.id)}
          />
          {isActionAvailable(record.status, 'cancel') && (
            <Popconfirm
              title="¿Cancelar RMA?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => onCancel(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                type="link"
                danger
                size="small"
                icon={<IconX size={16} />}
                title="Cancelar"
              />
            </Popconfirm>
          )}
        </Space>
      ),
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
        showTotal: (total) => `Total: ${total} devoluciones`,
        onChange: onPageChange,
      }}
      scroll={{ x: 'max-content' }}
    />
  );
};
