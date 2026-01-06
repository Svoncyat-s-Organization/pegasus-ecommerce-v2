import { Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RecentOrderResponse } from '@types';
import { formatCurrency } from '@shared/utils/formatters';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const { Title } = Typography;

interface RecentOrdersTableProps {
  data?: RecentOrderResponse[];
  loading?: boolean;
}

// Colores de tags por estado
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'orange',
    AWAIT_PAYMENT: 'gold',
    PAID: 'green',
    PROCESSING: 'blue',
    SHIPPED: 'cyan',
    DELIVERED: 'success',
    CANCELLED: 'error',
    REFUNDED: 'warning',
  };
  return colors[status] || 'default';
};

export const RecentOrdersTable = ({ data, loading }: RecentOrdersTableProps) => {
  const columns: ColumnsType<RecentOrderResponse> = [
    {
      title: 'N° Orden',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      fixed: 'left',
    },
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: true,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'right',
      render: (total: number) => formatCurrency(total),
    },
    {
      title: 'Estado',
      dataIndex: 'statusLabel',
      key: 'statusLabel',
      width: 130,
      render: (label: string, record: RecentOrderResponse) => (
        <Tag color={getStatusColor(record.status)}>{label}</Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm'),
    },
  ];

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        Pedidos Recientes
      </Title>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 700 }}
      />
    </Card>
  );
};
