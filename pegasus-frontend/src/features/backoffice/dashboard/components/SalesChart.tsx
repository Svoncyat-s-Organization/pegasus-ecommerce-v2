import { Card, Typography, Skeleton, Empty, theme } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartPointResponse } from '@types';
import { formatCurrency } from '@shared/utils/formatters';

const { Title } = Typography;
const { useToken } = theme;

interface SalesChartProps {
  data?: ChartPointResponse[];
  loading?: boolean;
  title?: string;
}

export const SalesChart = ({ data, loading, title = 'Ventas de los Últimos 30 Días' }: SalesChartProps) => {
  const { token } = useToken();

  if (loading) {
    return (
      <Card>
        <Title level={4}>{title}</Title>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <Title level={4}>{title}</Title>
        <Empty description="No hay datos disponibles" />
      </Card>
    );
  }

  // Transformar datos para Recharts (convertir value de string/number a number)
  const chartData = data.map((point) => ({
    ...point,
    value: typeof point.value === 'string' ? parseFloat(point.value) : point.value,
  }));

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 24 }}>
        {title}
      </Title>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2f54eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2f54eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={token.colorBorder} />
          <XAxis
            dataKey="label"
            stroke={token.colorTextSecondary}
            style={{ fontSize: 12 }}
          />
          <YAxis
            stroke={token.colorTextSecondary}
            style={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value.toString();
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: token.colorBgElevated,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: 6,
            }}
            formatter={(value: number | undefined) => {
              if (value !== undefined) {
                return [formatCurrency(value), 'Ventas'];
              }
              return [formatCurrency(0), 'Ventas'];
            }}
            labelFormatter={(label) => `Fecha: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2f54eb"
            strokeWidth={2}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
