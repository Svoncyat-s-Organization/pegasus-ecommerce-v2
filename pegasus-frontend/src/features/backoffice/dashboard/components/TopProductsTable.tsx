import { Card, Table, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TopProductResponse } from '@types';
import { formatCurrency } from '@shared/utils/formatters';

const { Title } = Typography;

interface TopProductsTableProps {
  data?: TopProductResponse[];
  loading?: boolean;
}

export const TopProductsTable = ({ data, loading }: TopProductsTableProps) => {
  const columns: ColumnsType<TopProductResponse> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, index) => (
        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'default'}>
          {index + 1}
        </Tag>
      ),
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: 'SKU',
      dataIndex: 'variantSku',
      key: 'variantSku',
      width: 120,
    },
    {
      title: 'Cantidad',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
      align: 'right',
      render: (quantity: number) => `${quantity} uds`,
    },
    {
      title: 'Ingresos',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 130,
      align: 'right',
      render: (revenue: number) => formatCurrency(revenue),
    },
  ];

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>
        Top 5 Productos Más Vendidos
      </Title>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="productId"
        loading={loading}
        pagination={false}
        size="small"
        bordered
      />
    </Card>
  );
};
