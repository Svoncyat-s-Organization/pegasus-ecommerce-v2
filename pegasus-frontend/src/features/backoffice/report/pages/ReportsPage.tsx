import { Card, Typography, Tabs } from 'antd';
import {
  IconChartBar,
  IconFileInvoice,
  IconPackage,
  IconBuildingWarehouse,
  IconCreditCard,
} from '@tabler/icons-react';
import { SalesReportView } from '../components/SalesReportView';
import { InvoiceReportView } from '../components/InvoiceReportView';
import { PurchaseReportView } from '../components/PurchaseReportView';
import { InventoryReportView } from '../components/InventoryReportView';
import { PaymentReportView } from '../components/PaymentReportView';

const { Title, Text } = Typography;

export const ReportsPage = () => {
  const tabItems = [
    {
      key: 'sales',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconChartBar size={18} />
          Ventas
        </span>
      ),
      children: <SalesReportView />,
    },
    {
      key: 'invoices',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconFileInvoice size={18} />
          Facturación
        </span>
      ),
      children: <InvoiceReportView />,
    },
    {
      key: 'purchases',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconPackage size={18} />
          Compras
        </span>
      ),
      children: <PurchaseReportView />,
    },
    {
      key: 'inventory',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconBuildingWarehouse size={18} />
          Inventario
        </span>
      ),
      children: <InventoryReportView />,
    },
    {
      key: 'payments',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconCreditCard size={18} />
          Pagos
        </span>
      ),
      children: <PaymentReportView />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <Card>
        <div style={{ marginBottom: 8 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Reportes
          </Title>
          <Text type="secondary">
            Genera y exporta reportes contables, de ventas, inventario y operaciones del negocio.
            Selecciona una categoría y define el período para generar el reporte.
          </Text>
        </div>
      </Card>

      {/* Report Tabs */}
      <Card>
        <Tabs
          defaultActiveKey="sales"
          items={tabItems}
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
        />
      </Card>
    </div>
  );
};
