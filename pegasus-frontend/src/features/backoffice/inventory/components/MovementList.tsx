import { Table, Tag } from 'antd';
import type { MovementResponse } from '@types';
import { OPERATION_TYPE_LABELS, OPERATION_TYPE_COLORS } from '../constants/inventoryConstants';
import { formatCurrency } from '@shared/utils/formatters';
import dayjs from 'dayjs';

interface MovementListProps {
  data: MovementResponse[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export const MovementList = ({
  data,
  loading,
  total,
  currentPage,
  pageSize,
  onPageChange,
}: MovementListProps) => {
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'SKU',
      dataIndex: 'variantSku',
      key: 'variantSku',
      width: 120,
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Almacén',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (name: string, record: MovementResponse) => `${record.warehouseCode} - ${name}`,
    },
    {
      title: 'Tipo Operación',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 180,
      render: (type: string) => (
        <Tag color={OPERATION_TYPE_COLORS[type as keyof typeof OPERATION_TYPE_COLORS]}>
          {OPERATION_TYPE_LABELS[type as keyof typeof OPERATION_TYPE_LABELS]}
        </Tag>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right' as const,
      render: (qty: number, record: MovementResponse) => {
        const isInbound = ['INVENTORY_ADJUSTMENT', 'PURCHASE', 'RETURN', 'CANCELLATION', 'TRANSFER_IN'].includes(
          record.operationType
        );
        return (
          <span style={{ color: isInbound ? 'green' : 'red', fontWeight: 'bold' }}>
            {isInbound ? '+' : '-'}
            {Math.abs(qty)}
          </span>
        );
      },
    },
    {
      title: 'Saldo',
      dataIndex: 'balance',
      key: 'balance',
      width: 100,
      align: 'right' as const,
    },
    {
      title: 'Costo Unit.',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right' as const,
      render: (cost: number) => formatCurrency(cost),
    },
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      bordered
      scroll={{ x: 1400 }}
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} movimientos`,
        onChange: onPageChange,
      }}
    />
  );
};
