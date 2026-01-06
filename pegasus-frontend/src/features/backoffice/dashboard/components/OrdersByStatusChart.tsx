import { Card, Typography, Skeleton, Empty, theme } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { OrdersByStatusResponse } from '@types';

const { Title } = Typography;
const { useToken } = theme;

interface OrdersByStatusChartProps {
  data?: OrdersByStatusResponse[];
  loading?: boolean;
}

// Colores semánticos por estado
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#faad14',      // Amarillo
  AWAIT_PAYMENT: '#fa8c16', // Naranja
  PAID: '#52c41a',         // Verde
  PROCESSING: '#1677ff',   // Azul
  SHIPPED: '#13c2c2',      // Cyan
  DELIVERED: '#52c41a',    // Verde
  CANCELLED: '#ff4d4f',    // Rojo
  REFUNDED: '#fa8c16',     // Naranja
};

const getColorForStatus = (status: string): string => {
  return STATUS_COLORS[status] || '#8c8c8c';
};

export const OrdersByStatusChart = ({ data, loading }: OrdersByStatusChartProps) => {
  const { token } = useToken();

  if (loading) {
    return (
      <Card>
        <Title level={4}>Pedidos por Estado</Title>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <Title level={4}>Pedidos por Estado</Title>
        <Empty description="No hay datos disponibles" />
      </Card>
    );
  }

  // Filtrar estados con count > 0 y transformar para Recharts
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      status: item.status,
      label: item.label,
      count: item.count,
      color: getColorForStatus(item.status),
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <Title level={4}>Pedidos por Estado</Title>
        <Empty description="No hay pedidos registrados" />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 24 }}>
        Pedidos por Estado
      </Title>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: token.colorBgElevated,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: 6,
            }}
            formatter={(value: number | undefined) => [`${value ?? 0} pedidos`, '']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: token.colorText, fontSize: 13 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
