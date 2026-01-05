import { Table, Tag } from 'antd';
import type { StockResponse } from '@types';
import { getStockStatusColor, getStockStatusText } from '../constants/inventoryConstants';
import dayjs from 'dayjs';

interface StockListProps {
  data: StockResponse[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export const StockList = ({
  data,
  loading,
  total,
  currentPage,
  pageSize,
  onPageChange,
}: StockListProps) => {
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'SKU',
      dataIndex: 'variantSku',
      key: 'variantSku',
      width: 150,
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
      width: 180,
      render: (name: string, record: StockResponse) => `${record.warehouseCode} - ${name}`,
    },
    {
      title: 'Cantidad Total',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right' as const,
    },
    {
      title: 'Reservado',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      width: 100,
      align: 'right' as const,
    },
    {
      title: 'Disponible',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      width: 120,
      align: 'right' as const,
      render: (available: number) => (
        <Tag color={getStockStatusColor(available)}>
          {available} - {getStockStatusText(available)}
        </Tag>
      ),
    },
    {
      title: 'Actualizado',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      bordered
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} registros`,
        onChange: onPageChange,
      }}
    />
  );
};
