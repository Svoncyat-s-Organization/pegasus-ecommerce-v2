import { Card, Statistic, Typography, Space, Skeleton } from 'antd';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import type { ReactNode } from 'react';

const { Text } = Typography;

interface TrendData {
  value: number;
  isPositive: boolean;
  label: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: TrendData;
  status?: 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  prefix?: string;
  suffix?: string;
}

const STATUS_COLORS = {
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1677ff',
};

export const MetricCard = ({
  title,
  value,
  icon,
  trend,
  status,
  loading,
  prefix,
  suffix,
}: MetricCardProps) => {
  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  const borderColor = status ? STATUS_COLORS[status] : undefined;

  return (
    <Card
      bordered
      style={{
        borderLeft: borderColor ? `4px solid ${borderColor}` : undefined,
        height: '100%',
      }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {title}
          </Text>
          <div style={{ color: '#2f54eb', fontSize: 24 }}>{icon}</div>
        </Space>

        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ fontSize: 28, fontWeight: 600 }}
        />

        {trend && (
          <Space size={4} style={{ marginTop: 4 }}>
            {trend.isPositive ? (
              <IconTrendingUp size={16} color="#52c41a" />
            ) : (
              <IconTrendingDown size={16} color="#ff4d4f" />
            )}
            <Text
              style={{
                fontSize: 13,
                color: trend.isPositive ? '#52c41a' : '#ff4d4f',
                fontWeight: 500,
              }}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value.toFixed(1)}%
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {trend.label}
            </Text>
          </Space>
        )}
      </Space>
    </Card>
  );
};
