import { Card, Row, Col, Typography, Button, Alert } from 'antd';
import { IconRefresh, IconCurrencyDollar, IconUsers, IconAlertTriangle, IconShoppingCart, IconRotate, IconPackage } from '@tabler/icons-react';
import { useDashboard } from '../hooks/useDashboard';
import { MetricCard } from '../components/MetricCard';
import { SalesChart } from '../components/SalesChart';
import { OrdersByStatusChart } from '../components/OrdersByStatusChart';
import { TopProductsTable } from '../components/TopProductsTable';
import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { LowStockAlert } from '../components/LowStockAlert';
import { formatCurrency } from '@shared/utils/formatters';

const { Title, Text } = Typography;

export const DashboardPage = () => {
  const { data, isLoading, error, refetch, isRefetching } = useDashboard();

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <Card>
        <Alert
          type="error"
          message="Error al cargar el dashboard"
          description={(error as Error).message || 'No se pudieron cargar los datos'}
          action={
            <Button type="primary" onClick={handleRefresh}>
              Reintentar
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ marginBottom: 4 }}>
              Dashboard
            </Title>
            <Text type="secondary">
              Métricas y estadísticas en tiempo real
            </Text>
          </div>
          <Button
            icon={<IconRefresh size={18} />}
            onClick={handleRefresh}
            loading={isRefetching}
          >
            Actualizar
          </Button>
        </div>
      </Card>

      {/* Métricas Principales - Fila 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="Ventas del Mes"
            value={formatCurrency(data?.sales.totalSales || 0)}
            icon={<IconCurrencyDollar />}
            trend={
              data?.sales.salesGrowthPercent !== undefined
                ? {
                    value: data.sales.salesGrowthPercent,
                    isPositive: data.sales.salesGrowthPercent >= 0,
                    label: 'vs mes anterior',
                  }
                : undefined
            }
            status="success"
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="Clientes Nuevos"
            value={data?.customers.newCustomersThisMonth || 0}
            icon={<IconUsers />}
            suffix="clientes"
            trend={
              data?.customers.customerGrowthPercent !== undefined
                ? {
                    value: data.customers.customerGrowthPercent,
                    isPositive: data.customers.customerGrowthPercent >= 0,
                    label: 'vs mes anterior',
                  }
                : undefined
            }
            status="info"
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="Productos con Stock Bajo"
            value={data?.inventory.lowStockCount || 0}
            icon={<IconAlertTriangle />}
            suffix="productos"
            status={
              data?.inventory.lowStockCount
                ? data.inventory.lowStockCount > 20
                  ? 'error'
                  : 'warning'
                : 'success'
            }
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* Métricas Secundarias - Fila 2 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="Pedidos del Mes"
            value={data?.sales.totalOrders || 0}
            icon={<IconShoppingCart />}
            suffix="órdenes"
            trend={
              data?.sales.ordersGrowthPercent !== undefined
                ? {
                    value: data.sales.ordersGrowthPercent,
                    isPositive: data.sales.ordersGrowthPercent >= 0,
                    label: 'vs mes anterior',
                  }
                : undefined
            }
            status="info"
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="Devoluciones Pendientes"
            value={data?.rma.pendingRmas || 0}
            icon={<IconRotate />}
            suffix="RMAs"
            status={
              data?.rma.pendingRmas
                ? data.rma.pendingRmas > 10
                  ? 'error'
                  : 'warning'
                : 'success'
            }
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <MetricCard
            title="Compras del Mes"
            value={formatCurrency(data?.purchases.totalPurchasesAmount || 0)}
            icon={<IconPackage />}
            status="info"
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* Gráfico de Ventas - Full Width */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <SalesChart
            data={data?.charts.dailySales}
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* Gráficos y Tablas - Row 3 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <OrdersByStatusChart
            data={data?.ordersByStatus}
            loading={isLoading}
          />
        </Col>
        <Col xs={24} lg={14}>
          <TopProductsTable
            data={data?.topProducts}
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* Tablas y Alertas - Row 4 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <RecentOrdersTable
            data={data?.recentOrders}
            loading={isLoading}
          />
        </Col>
        <Col xs={24} lg={10}>
          <LowStockAlert
            data={data?.inventory.lowStockProducts}
            count={data?.inventory.lowStockCount}
            loading={isLoading}
          />
        </Col>
      </Row>
    </div>
  );
};
